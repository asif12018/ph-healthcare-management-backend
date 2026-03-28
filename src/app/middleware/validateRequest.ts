import { NextFunction, Request, Response } from "express";
import z from "zod";








//zod validation middleware function
export const validateRequest =(zodSchema: z.ZodObject)=>{
  return (req: Request, res: Response, next: NextFunction)=>{
    if(req.body.data){
      req.body = JSON.parse(req.body.data);
    }
      const parseResult = zodSchema.safeParse(req.body);
      if(!parseResult.success){
        return next(parseResult.error);
      }
      //sanitizing the data
      req.body = parseResult.data;
      next();
  }

}