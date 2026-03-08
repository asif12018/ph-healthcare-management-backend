import { Request, Response } from "express";

import { authService } from "./auth.service";

import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";



//registered a paitent
const registerPaitent = catchAsync(async(req:Request, res:Response)=>{
    const payload = req.body;
    const result = await authService.registerPaitent(payload);
    sendResponse(res,{
        httpStatusCode:status.CREATED,
        success: true,
        message:"Patient created successfully",
        data: result
    })
});

//login user

const loginUser = catchAsync(async(req:Request, res:Response)=>{
    const payload = req.body;
    const result = await authService.loginUser(payload);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message:"User login successfull",
        data: result
    })
})


export const AuthController = {
    registerPaitent,
    loginUser
}