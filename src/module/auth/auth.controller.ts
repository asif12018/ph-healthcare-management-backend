import { Request, Response } from "express";
import { catchAsync } from "../../app/shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../app/shared/sendResponse";
import status from "http-status";



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