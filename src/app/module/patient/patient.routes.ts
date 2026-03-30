import { NextFunction, Request, Response, Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { PatientController } from "./patient.controller";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { PatientValidation } from "./patient.validation";
import { multerUpload } from "../../../config/multer.config";
import { updateMyPatientProfileMiddleware } from "./patient.middlewares";



const router = Router();



router.patch("/update-my-profile", 
checkAuth(Role.PATIENT), 
multerUpload.fields([{name:"profilePhoto", maxCount:1}, {name:"medicalReports", maxCount:5}]),
// (req:Request, res:Response, next:NextFunction)=>{
//     const payload: IUpdatePatientProfilePayload = req.body;
//     const files = req.files as {[fieldName: string]: Express.Multer.File[]};
//     if(files?.profilePhoto?.[0]){
//         if(!payload.patientInfo){
//             payload.patientInfo = {} as IUpdatePatientInfoPayload;
//         }
//         payload.patientInfo.profilePhoto = files.profilePhoto[0].path;
//     }
//     if(files?.medicalReports && files?.medicalReports.length > 0){
//         const newReports = files.medicalReports.map((file)=>({
//             reportName : file.originalname || `Medical Report - ${new Date().getTime()}`,
//             reportLink : file.path
//         }));

//         if(payload.medicalReports && Array.isArray(payload.medicalReports)){
//             payload.medicalReports = [...payload.medicalReports, ...newReports]
//         }else{
//             payload.medicalReports = newReports;
//         }
//     }

//     req.body = payload;
    
//     next();
// }
updateMyPatientProfileMiddleware
,validateRequest(PatientValidation.updatePatienProfileZodSchema),PatientController.updateMyProfile);

export const PatientRoutes = router;