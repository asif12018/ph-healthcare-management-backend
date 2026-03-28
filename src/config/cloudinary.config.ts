import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/AppError";
import status from "http-status";


cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_SECRET,
});


export const deleteFileFromCloudinary = async(url: string) =>{
   try{
 const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if(match && match[1]){
        const publicId = match[1];
        await cloudinary.uploader.destroy(publicId,{resource_type:"image"});
        console.log(`File ${publicId} deleted from cloudinary`)
    }
   }catch(err){
    console.log('deletation failed. error:', err);
    throw new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to delete file from cloudinary');
   }
 
}

export const uploadFileToCloudinary = async(buffer:Buffer, fileName:string): Promise<UploadApiResponse>=>{
   if(!buffer || !fileName){
      throw new AppError(status.BAD_REQUEST, 'Buffer and file name are required');
   }
   
        const extension = fileName?.split(".").pop()?.toLowerCase();
        const fileNameWithOutExtension = fileName?.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

        //creating unique name for file

        const uniqueName = Math.random().toString(36).substring(2)+"-"+Date.now()+"-"+fileNameWithOutExtension;

        const folder = extension === "pdf" ? "pdfs":"images";
        return new Promise((resolve, reject)=>{
            cloudinary.uploader.upload_stream({
                resource_type:"auto",
                public_id:`ph-healthcare/${folder}/${uniqueName}`,
                folder: `ph-healthcare/${folder}`
            },
            (error, result)=>{
                if(error){
                    return reject(new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to upload file to cloudinary'));
                }
                resolve(result as UploadApiResponse)
            }
        
        ).end(buffer);
        })
}

export const cloudinaryUpload = cloudinary