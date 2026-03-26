import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../../config/env";
import { CookieUtils } from "./cookie";
import ms, { type StringValue } from "ms";
import { Response } from "express";

//generate access token
const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
  );

  return accessToken;
};

//generate refresh token
const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
  );

  return refreshToken;
};

//set access token cookie

const setAccessTokenCookie = (res: Response, token: string) => {
//   const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue);
//   console.log('access token max age', maxAge)
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //set access token should be 1day
    maxAge: 60 * 60 * 24 * 1000,
  });
};

//set refresh token cookie

const setRefreshTokenCookie = (res: Response, token: string) => {
//   const maxAge = ms(envVars.REFRESH_TOKEN_EXPIRES_IN as StringValue);
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //max age is 7days
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
};

// set set better auth session cookie

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  const maxAge = ms(envVars.REFRESH_TOKEN_EXPIRES_IN as StringValue);
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //max is 1day
    maxAge:  60 * 60 * 24 * 1000,
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
