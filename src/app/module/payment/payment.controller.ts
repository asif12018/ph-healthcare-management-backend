import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../../config/env";
import status from "http-status";
import Stripe from "stripe";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";



const handleStripeWebHookEvent = catchAsync(async(req:Request, res:Response)=>{
    const signature = req.headers["stripe-singnature"] as string;
    const webhookSecret =  envVars.STRIPE.STRIPE_WEBHOOK_SECRETE;
    if(!signature || webhookSecret){
        console.error("Missing Stripe signature or webhook secret");
        return res.status(status.BAD_REQUEST).json({message: "Missing Stripe signature or webhook secret"});
    }

    let event ;
    try{
        event = Stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

    }catch(err:any){
        console.log(`Error constructing webhook event: ${err}`);
        return res.status(status.BAD_REQUEST).json({message: "Error processing Stripe webhook"});
    }

    try{
        const result = await PaymentService.handleStripeWebHookEvent(event);
        sendResponse(res,{
            httpStatusCode: status.OK,
            success: true,
            message: "Stripe webhook event processed successfully",
            data: result
        })

    }catch(err){
        console.log(`Error processing webhook event: ${err}`);
        sendResponse(res,{
            httpStatusCode: status.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Error processing Stripe webhook",
            
        })
    }
    
});

export const PaymentController = {
    handleStripeWebHookEvent
}