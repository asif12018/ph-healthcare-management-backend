import status from "http-status";
// import { uuidv7 } from "zod/mini";
import { v7 as uuidv7 } from "uuid";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";

import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { AppointmentStatus } from './../../../generated/prisma/enums';
import { IBookAppointmentPayload } from "./appointment.interface";
import { stripe } from "../../../config/stripe.config";
import { envVars } from "../../../config/env";
import AppError from "../../../errorHelpers/AppError";

/**
 * 1. Book Appointment with Pay Now
 * This function handles the booking of an appointment and immediate payment setup via Stripe.
 */
const bookAppointment = async (payload : IBookAppointmentPayload, user : IRequestUser) => {
    // Step 1: Find the patient details using the logged-in user's email
    const patientData = await prisma.patient.findUniqueOrThrow({
        where : {
            email : user.email,
        }
    });

    // Step 2: Ensure the requested doctor exists and is not deleted
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where : {
            id : payload.doctorId,
            isDeleted : false,
        }
    });

    // Step 3: Check if the provided schedule exists
    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where : {
            id : payload.scheduleId,
        }
    });

    // Step 4: Verify that the doctor is actually available at this specific schedule
    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where : {
            doctorId_scheduleId:{
                doctorId : doctorData.id,
                scheduleId : scheduleData.id,   
            }
        }
    });
   
    // Step 5: Generate a unique ID for the video call (used if the appointment is online)
    const videoCallingId = String(uuidv7());

    // Step 6: Use a Prisma transaction to ensure all database operations succeed together or fail together.
    // If any operation fails, none of the changes will be saved to the database.
    const result = await prisma.$transaction(async (tx) => {
        // Create the actual appointment record
        const appointmentData = await tx.appointment.create({
            data : {
                doctorId : payload.doctorId,
                patientId : patientData.id,
                scheduleId : doctorSchedule.scheduleId,
                videoCallingId,
            }
        });

        // Mark the doctor's schedule as booked so no one else can book this slot
        await tx.doctorSchedules.update({
            where : {
                doctorId_scheduleId:{
                    doctorId : payload.doctorId,
                    scheduleId : payload.scheduleId,
                }
            },
            data : {
                isBooked : true,
            }
        });

        // Step 7: Create a payment record in our database
        const transactionId = String(uuidv7()); // Generate a unique transaction ID
        const paymentData = await tx.payment.create({
            data : {
                appointmentId : appointmentData.id,
                amount : doctorData.appointmentFee,
                transactionId
            }
        });
        
        // Step 8: Create a Stripe checkout session for the actual payment processing
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items :[
                {
                    price_data:{
                        currency:"bdt", // Currency set to Bangladeshi Taka
                        product_data:{
                            name : `Appointment with Dr. ${doctorData.name}`,
                        },
                        unit_amount : doctorData.appointmentFee * 100, // Stripe expects amount in cents/paisa
                    },
                    quantity : 1,
                }
            ],
            // Store our internal IDs in Stripe's metadata to link the payment back to our system later
            metadata:{
                appointmentId : appointmentData.id,
                paymentId : paymentData.id,
            },
            // Where to redirect the user after a successful or cancelled payment
            success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
            cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
        })

        return {
            appointmentData,
            paymentData,
            paymentUrl : session.url, // Return the Stripe URL so the frontend can redirect the user
        };
    });

    return {
        appointment : result.appointmentData,
        payment : result.paymentData,
        paymentUrl : result.paymentUrl,
    };
}

/**
 * 2. Get My Appointments
 * Fetches all appointments for the currently logged-in user.
 * It dynamically checks whether the user is a Patient or a Doctor and returns the relevant data.
 */
const getMyAppointments = async (user: IRequestUser) => {
    // First, try to find if the user is a patient
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    // Then, try to find if the user is a doctor
    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointments = [];

    // If the user is a patient, fetch appointments where they are the patient
    // and include the doctor's and schedule's details
    if (patientData) {
        appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        });
    } 
    // If the user is a doctor, fetch appointments where they are the doctor
    // and include the patient's and schedule's details
    else if (doctorData) {
        appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                schedule: true
            }
        });
    } 
    // If the user is neither, throw an error
    else {
        throw new Error("User not found");
    }

    return appointments;
}

/**
 * 3. Change Appointment Status
 * Allows updating the status of an appointment (e.g., SCHEDULED to INPROGRESS, or COMPLETED).
 * Includes permission checks to ensure doctors can only update their own appointments.
 */
// Rules:
// 1. Completed Or Cancelled Appointments should not be allowed to update status
// 2. Doctors can only update Appoinment status from schedule to inprogress or inprogress to complted or schedule to cancelled.
// 3. Patients can only cancel the scheduled appointment if it scheduled not completed or cancelled or inprogress. 
// 4. Admin and Super admin can update to any status.
const changeAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: IRequestUser) => {
    // Find the appointment and include the doctor's details to verify ownership later
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true
        }
    });

    // If the logged-in user is a DOCTOR, verify that this appointment actually belongs to them
    if (user?.role === Role.DOCTOR) {
        if (!(user?.email === appointmentData.doctor.email))
            throw new AppError(status.BAD_REQUEST, "This is not your appointment")
    }

    // Update the appointment with the new status
    return await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status: appointmentStatus
        }
    })
}

/**
 * 4. Get My Single Appointment
 * Retrieves the details of a specific single appointment by its ID.
 * Similar to getMyAppointments, it checks if the user is a patient or a doctor.
 */
// refactoring on include of doctor and patient data in appointment details, we can use query builder to get the data in single query instead of multiple queries in case of doctor and patient both
const getMySingleAppointment = async (appointmentId: string, user: IRequestUser) => {
    // Identity verification (same logic as getMyAppointments)
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user?.email
        }
    });

    let appointment;

    if (patientData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                patientId: patientData.id // Ensure the appointment belongs to this patient
            },
            include: {
                doctor: true,
                schedule: true
            }
        });
    } else if (doctorData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                doctorId: doctorData.id // Ensure the appointment belongs to this doctor
            },
            include: {
                patient: true,
                schedule: true
            }
        });
    }

    // If no appointment is found (or the user doesn't have access to it), throw an error
    if (!appointment) {
        throw new AppError(status.NOT_FOUND, "Appointment not found");
    }

    return appointment;
}

/**
 * 5. Get All Appointments
 * An admin/system function to fetch all appointments across the entire platform.
 */
// integrate query builder
const getAllAppointments = async () => {
    const appointments = await prisma.appointment.findMany({
        include: {
            doctor: true,
            patient: true,
            schedule: true
        }
    });
    return appointments;
}

/**
 * 6. Book Appointment with Pay Later
 * Similar to bookAppointment, but this skips the Stripe payment session creation.
 * The user reserves the slot but pays at a later time.
 */
const bookAppointmentWithPayLater = async (payload : IBookAppointmentPayload, user : IRequestUser) => {
    // Step 1 & 2: Validate Patient and Doctor
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: { id: payload.doctorId, isDeleted: false }
    });

    // Step 3 & 4: Validate Schedule availability
    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where: { id: payload.scheduleId }
    });

    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleData.id,
            }
        }
    });

    const videoCallingId = String(uuidv7());

    // Step 5: Database transaction to save appointment and block the schedule
    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                doctorId: payload.doctorId,
                patientId: patientData.id,
                scheduleId: doctorSchedule.scheduleId,
                videoCallingId,
            }
        });

        // Block the schedule slot
        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId,
                }
            },
            data: { isBooked: true }
        });

        // Create an unpaid payment tracking record
        const transactionId = String(uuidv7());
        const paymentData = await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId,
             }
        });

        return {
            appointment: appointmentData,
            payment: paymentData
        };
    });

    return result;
}  

/**
 * 7. Initiate Payment
 * Used when a patient booked a "Pay Later" appointment and now wants to complete the payment.
 */
const initiatePayment = async (appointmentId: string, user : IRequestUser) => {
    // Ensure the patient exists
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    });

    // Find the appointment and its associated payment record
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
            patientId: patientData.id,
        },
        include: {
            doctor: true,
            payment: true, // We need the payment record to know how much to charge
        }
    });

    // Validation checks
    if(!appointmentData) throw new AppError(status.NOT_FOUND, "Appointment not found");
    if(!appointmentData.payment) throw new AppError(status.NOT_FOUND, "Payment data not found for this appointment");
    if(appointmentData.payment?.status === PaymentStatus.PAID) throw new AppError(status.BAD_REQUEST, "Payment already completed for this appointment");
    if(appointmentData.status === AppointmentStatus.CANCELED) throw new AppError(status.BAD_REQUEST, "Appointment is canceled");

    // Generate the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: "bdt",
                    product_data: {
                        name: `Appointment with Dr. ${appointmentData.doctor.name}`,
                    },
                    unit_amount: appointmentData.doctor.appointmentFee * 100, // Amount in cents
                },
                quantity: 1,
            }
        ],
        metadata: {
            appointmentId: appointmentData.id,
            paymentId: appointmentData.payment.id,
        },
        // Callbacks for success or cancellation
        success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointmentData.id}&payment_id=${appointmentData.payment.id}`,
        cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments?error=payment_cancelled`,
    })

    return {
        paymentUrl: session.url, // Return the checkout URL to the frontend
    }
}

/**
 * 8. Cancel Unpaid Appointments
 * A background job/cron task function that cleans up appointments which were booked but
 * haven't been paid for within 30 minutes, freeing up the doctor's schedule.
 */
const cancelUnpaidAppointments = async () => {
    // Calculate the time exactly 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find all unpaid appointments created more than 30 minutes ago
    const unpaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: { lte: thirtyMinutesAgo },  // lte = less than or equal to (older than)
            paymentStatus: PaymentStatus.UNPAID,
        },
    });

    // Extract just the IDs for bulk updating
    const appointmentToCancel = unpaidAppointments.map(appointment => appointment.id);

    // Transaction to safely rollback everything if any step fails
    await prisma.$transaction(async (tx) => {
        // Step 1: Mark all these appointments as CANCELED
        await tx.appointment.updateMany({
            where: { id: { in: appointmentToCancel } },
            data: { status: AppointmentStatus.CANCELED },
        });

        // Step 2: Delete their associated pending payment records
        await tx.payment.deleteMany({
            where: { appointmentId: { in: appointmentToCancel } },
        });

        // Step 3: Loop through each canceled appointment and free up the doctor's schedule slot
        for(const unpaidAppointment of unpaidAppointments){
            await tx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unpaidAppointment.doctorId,
                        scheduleId: unpaidAppointment.scheduleId,
                    },
                },
                data: {
                    isBooked: false, // Make the slot available again
                },
            });
        }
    });
}

// Export all the service functions so they can be used in controllers
export const AppointmentService = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getMySingleAppointment,
    getAllAppointments,
    bookAppointmentWithPayLater,
    initiatePayment,
    cancelUnpaidAppointments,
}