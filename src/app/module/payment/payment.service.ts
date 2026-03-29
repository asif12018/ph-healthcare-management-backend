import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";



const handleStripeWebHookEvent = async(event: Stripe.Event)=>{
    //checking if the existing payment happened
    const existingPayment = await prisma.payment.findFirst({
        where:{
            stripeEventId: event.id
        }
    });
    // stoping if already paided
    if(existingPayment){
        console.log(`Event ${event.id} already processed. skipping..`);
        return {message:`Event ${event.id} already processed. skipping..`}
    }
    switch(event.type){
        //updating payment status if the payment is completed
        case "checkout.session.completed": {
            const session = event.data.object;
            const appointmentsId = session?.metadata?.appointmentsId;
            const paymentId  = session?.metadata?.paymentId;
            if(!paymentId || !appointmentsId){
                console.error("Missing appointment or payment in session metadata");
                return {message: "Missing appointmentId or paymentId in session metadata"};
            }
            const appointment = await prisma.appointment.findUnique({
                where:{
                    id: appointmentsId
                }
            });
            if(!appointment){
                console.error("Appointment not found");
                return {message: "Appointment not found"};
            }
            //after successfull payment updating appointment paymentStatus to paid 
            await prisma.$transaction(async(tx)=>{
                await tx.appointment.update({
                    where:{
                        id: appointmentsId
                    },
                    data:{
                        paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                    }
                });
                //after updating appointment status updating payment status to paid
                await tx.payment.update({
                    where:{
                        id: paymentId
                    },
                    data:{
                        stripeEventId: event.id,
                        status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                        paymentGatewayData: session as any
                    }
                })
            });
            console.log(`payment completed for appointment ${appointmentsId}`);
            return {message: `payment completed for appointment ${appointmentsId}`};
            break;
        }
        case "checkout.session.expired": {
            const session = event.data.object;
            console.log(`checkout session ${session.id} expired. Marking associated payment as failed`);
            break;
        }
        case "payment_intent.payment_failed": {
            const session = event.data.object;
            console.log(`payment intent ${session.id} failed. Marking associated payment as failed`);
            break;
        }
         default:
            console.log(`Unhandled event type: ${event.type}`);
            
    }
    return {message: `Webhook Event ${event.type} processed successfully`};
}


export const PaymentService = {
    handleStripeWebHookEvent
}