/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable preserve-caught-error */

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

//create token for jwt
const createToken = (
  payload: JwtPayload,
  secret: string,
  { expiresIn }: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn });

  return token;
};

// verify token for jwt

const verifyToken = (token: string, secret: string) => {
  try {
    const decode = jwt.verify(token, secret);
    return {
      success: true,
      data: decode,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
      err,
    };
  }
};

//decode token for jwt

const decodeToken = (token: string) => {
  const decode = jwt.decode(token) as JwtPayload;
  return decode;
};


export const jwtUtils = {
    createToken,
    verifyToken,
    decodeToken
}