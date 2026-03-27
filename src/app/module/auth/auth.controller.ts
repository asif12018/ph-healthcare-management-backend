import { Request, Response } from "express";

import { authService } from "./auth.service";

import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import { envVars } from "../../../config/env";
import ms, { type StringValue } from "ms";
import AppError from "../../../errorHelpers/AppError";
import { CookieUtils } from "../../utils/cookie";


//registered a paitent
const registerPaitent = catchAsync(async(req:Request, res:Response)=>{
    const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue);
      console.log('access token max age', maxAge)
    const payload = req.body;
    const result = await authService.registerPaitent(payload);
        const {accessToken, refreshToken, token, ...rest} = result;
    //set access token in cookies
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResponse(res,{
        httpStatusCode:status.CREATED,
        success: true,
        message:"Patient created successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        }
    })
});

//login user

const loginUser = catchAsync(async(req:Request, res:Response)=>{
    const payload = req.body;
    const result = await authService.loginUser(payload);
    const {accessToken, refreshToken, token, ...rest} = result;
    //set access token in cookies
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);

    
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message:"User login successfull",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        }
    })
})

//get user own profile

const getMe = catchAsync(async(req:Request, res:Response)=>{
    const user = req.user;
    const result = await authService.getMe(user);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message:"User profile fetched successfully",
        data: result
    })
})

//get new Token 
const getNewToken = catchAsync(async(req:Request, res:Response)=>{
   const refreshToken = req.cookies.refreshToken;
   const betterAuthSessionToken = req.cookies["better-auth.session_token"];
 
//    if(!betterAuthSessionToken){
//     throw new AppError(status.UNAUTHORIZED, "Session token not found")
//    }
   if(!refreshToken){
    throw new AppError(status.UNAUTHORIZED, "Refresh token not found")
   }
   const result = await authService.getNewToken(refreshToken, betterAuthSessionToken);
   const {accessToken, refreshToken: newRefreshToken, sessionToken} = result;
   //set access token in cookies
   tokenUtils.setAccessTokenCookie(res, accessToken);
   tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
   tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
   sendResponse(res,{
    httpStatusCode:status.OK,
    success: true,
    message:"Token refreshed successfully",
    data: {
        sessionToken,
        accessToken,
        newRefreshToken,
    }
   })
});

//change password
const changePassword = catchAsync(async(req:Request, res:Response)=>{
    const sessionToken = req.cookies["better-auth.session_token"];
    const payload = req.body;
    const result = await authService.changePassword(payload, sessionToken);
    const {accessToken, refreshToken, token, ...rest} = result;
    //set access token in cookies
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message:"Password changed successfully",
        data: result
    })
})

//logout user

const logOutUser = catchAsync(async(req:Request, res:Response)=>{
    const sessionToken = req.cookies["better-auth.session_token"];
    const result = await authService.logOutUser(sessionToken);
    //clear all the cookies
    CookieUtils.clearCookie(res, 'accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    CookieUtils.clearCookie(res, 'refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    CookieUtils.clearCookie(res, 'better-auth.session_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message:"User logged out successfully",
        data: result
    })
})

//verify email
const verifyEmail = catchAsync(async(req:Request, res:Response)=>{
    const {email, otp} = req.body;
   await authService.verifyEmail(email, otp);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message:"Email verified successfully",
    })
})

//forget password
const forgetPassword = catchAsync(async(req:Request, res:Response)=>{
    const {email} = req.body;
    await authService.forgetPassword(email);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message:"Password reset email sent successfully",
    })
})

//reset password
const resetPassword = catchAsync(async(req:Request, res:Response)=>{
    const {email, otp, newPassword} = req.body;
    await authService.resetPassword(email, otp, newPassword);
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message:"Password reset successfully",
    })
})


export const AuthController = {
    registerPaitent,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logOutUser,
    verifyEmail,
    forgetPassword,
    resetPassword
}