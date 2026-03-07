import { Request, Response } from "express";
import { catchAsync } from "../../app/shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../app/shared/sendResponse";



//registered a paitent
const registerPaitent = catchAsync(async(req:Request, res:Response)=>{
    const payload = req.body;
    const result = await authService.registerPaitent(payload);
    sendResponse(res,{
        httpStatusCode:201,
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
        httpStatusCode:200,
        success: true,
        message:"User login successfull",
        data: result
    })
})


export const AuthController = {
    registerPaitent,
    loginUser
}