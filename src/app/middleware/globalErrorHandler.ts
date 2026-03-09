import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSource } from "../interfaces/error.interface";
import { handleZodError } from "../../errorHelpers/handleZodErrors";

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
    errorSources = [...simplifiedError.errorSources!]
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : null,
  };

  res.status(statusCode).json(errorResponse);
};
