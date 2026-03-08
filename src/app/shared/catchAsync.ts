import { NextFunction, Request, RequestHandler, Response } from "express"
import status from "http-status"

export const catchAsync = (fn: RequestHandler) =>{
    return async(req:Request, res:Response, next:NextFunction)=>{
         try{
             await fn(req, res, next)
         }catch(error:any){
            // res.status(status.INTERNAL_SERVER_ERROR).json({
            //     success: false,
            //     message: "Failed to create specialty",
            //     error: error.message
            // })

            //now we are using global error handler
            next(error);
         }
    }
}