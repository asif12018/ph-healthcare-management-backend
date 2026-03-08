
import { Request, Response } from "express";

import { DoctorService } from "./doctor.service";

import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";




//get all doctor


const getAllDoctors = catchAsync(async(req:Request, res:Response)=>{
    const doctors = await DoctorService.getAllDoctors();
    sendResponse(res,{
        httpStatusCode:status.OK,
        success: true,
        message: "Doctors fetched successfully",
        data: doctors
    })
});


export const DoctorController = {
    getAllDoctors
}