import { CookieOptions, Response, Request } from "express";



//function to set cookie



const setCookie = (res:Response, key:string, value: string, options: CookieOptions) =>{
   res.cookie(key,value, options)
}




//get cookie

const getCookie = (req:Request, key: string) =>{
    return req.cookies[key];
}


//clear cookie

const clearCookie = (res:Response, key: string, options: CookieOptions)=>{
    res.clearCookie(key, options);
}




export const CookieUtils = {
    setCookie,
    getCookie,
    clearCookie
}