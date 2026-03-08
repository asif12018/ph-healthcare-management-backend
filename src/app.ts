import express, { Application, NextFunction, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { IndexRoute } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFount } from "./app/middleware/notFoundRoute";


const app:Application = express();
export const port = 5000;



app.use(express.urlencoded({extended: true}));


app.use(express.json());


//specailty route

app.use("/api/v1", IndexRoute);

app.get("/", async(req:Request, res:Response)=>{

    res.status(200).json({
        success: true,
        message:`server is running on port: ${port}`,
    
    })
});

//global error handler
app.use(globalErrorHandler);

//not found route

app.use(notFount);

export default app