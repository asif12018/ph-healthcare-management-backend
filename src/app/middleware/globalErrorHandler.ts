import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSource } from "../interfaces/error.interface";
import { handleZodError } from "../../errorHelpers/handleZodErrors";
import AppError from "../../errorHelpers/AppError";

//global error handler

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from global error handler", err);
  }

  //extra code to handle zod validation error
  let errorSources: TErrorSource[] = [];

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let stack: string | undefined;

  if (err instanceof z.ZodError) {
    // statusCode = status.BAD_REQUEST;
    // message = "Zod Validation Error";
    // err.issues.forEach((issue) => {
    //   errorSources.push({
    //     path: issue.path.join(" => ") || "unknown",
    //     message: issue.message,
    //   });
    // });
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources!];
    stack = err.stack;
  }else if(err instanceof AppError){
     statusCode = err.statusCode;
     message = err.message;
     stack = err.stack;
     errorSources = [
      {
        path:"",
        message: err.message
      }
     ];
  }else if(err instanceof Error){
    //handling javascript error or nodejs error
     statusCode = status.INTERNAL_SERVER_ERROR;
     message = err.message;
     stack = err.stack;
     errorSources = [
      {
        path:"",
        message: err.message
      }
     ]
  }
  
  

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSources,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
    error: envVars.NODE_ENV === "development" ? err : null,
  };

  res.status(statusCode).json(errorResponse);
};
