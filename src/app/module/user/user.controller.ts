import { Request, Response } from "express";

import { UserService } from "./user.service";

import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";






const createDoctor = catchAsync(async(req:Request, res:Response)=>{
    const payload = req.body;
    
    const result = await UserService.createDoctor(payload);
    sendResponse(res,{
        httpStatusCode: status.CREATED,
        success:true,
        message:"Doctor created succesfully",
        data: result
    })
});


export const UserController = {
    createDoctor
}