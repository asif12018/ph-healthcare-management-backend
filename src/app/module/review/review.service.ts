import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";


const giveReview = async (user:IRequestUser, payload:ICreateReviewPayload) =>{
     const patientData = await prisma.patient.findUniqueOrThrow({
        where:{
            email: user.email
        }
     });

     const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where:{
            id: payload.appointmentId
        }
     });

     if(appointmentData.paymentStatus !== PaymentStatus.PAID){
        throw new AppError(status.BAD_REQUEST, "You can not review without payment");
     }

     if(appointmentData.patientId !== patientData.id){
        throw new AppError(status.BAD_REQUEST, "you can only review for your own appointments")
     }

     const isReviewed = await prisma.review.findFirst({
        where:{
            appointmentId: payload.appointmentId,
        }
     });

     if(isReviewed){
        throw new AppError(status.BAD_REQUEST, "You can not review more than once");
     }

     const result = await prisma.$transaction(async(tx)=>{
        const review = await tx.review.create({
            data:{
                ...payload,
                patientId: appointmentData.patientId,
                doctorId: appointmentData.doctorId
            }
        });

        const averageRating = await tx.review.aggregate({
            _avg:{
                rating: true
            },
            where:{
                doctorId: appointmentData.doctorId
            }
        }) || {_avg: {rating:0}};

        await tx.doctor.update({
            where:{
                id: appointmentData.doctorId
            },
            data:{
                averageRating: averageRating._avg.rating as number
            }
        });

       

        return review;
        
     
    });

    return result;

}



export const ReviewService = {
    giveReview
}