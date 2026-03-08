import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";






//global error handler

export const globalErrorHandler = ((err:any, req:Request, res:Response, next:NextFunction)=>{
     if(envVars.NODE_ENV === "development"){
          console.log("Error from global error handler",err);
     }

     let statusCode:number = status.INTERNAL_SERVER_ERROR;
     let message: string = "Internal Server Error";


     res.status(statusCode).json({
        success: false,
        message:message,
        error: err.message
     })
});