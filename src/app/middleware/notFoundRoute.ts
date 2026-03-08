import { Request, Response } from "express";
import { sendResponse } from "../shared/sendResponse";
import status from "http-status";



//not found route


export const notFount = (req:Request, res:Response) =>{
    sendResponse(res,{
        httpStatusCode: status.NOT_FOUND,
        success:false,
        message:`Route ${req.originalUrl} not found`
    })
}