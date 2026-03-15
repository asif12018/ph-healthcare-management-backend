import { Request, Response } from "express";

import { authService } from "./auth.service";

import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { tokenUtils } from "../../utils/token";
import { envVars } from "../../../config/env";
import ms, { type StringValue } from "ms";


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


export const AuthController = {
    registerPaitent,
    loginUser
}