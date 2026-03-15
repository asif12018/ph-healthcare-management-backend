import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../../config/env";
import { CookieUtils } from "./cookie";
import ms from "ms";
import { Response } from "express";




//generate access token
const getAccessToken = (payload: JwtPayload)=>{
    const accessToken =  jwtUtils.createToken(payload, 
        envVars.ACCESS_TOKEN_SECRET,
        {expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN} as SignOptions
    );

    return accessToken
}

//generate refresh token
const getRefreshToken = (payload: JwtPayload)=>{
    const refreshToken =  jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET,
        {expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN} as SignOptions
    );

    return refreshToken
}

//set access token cookie

const setAccessTokenCookie = (res: Response, token: string) => {
    const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as any) as unknown as number;
     CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: maxAge
     })
}


export const tokenUtils = {
    getAccessToken,
    getRefreshToken
}