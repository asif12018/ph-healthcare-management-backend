import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";


interface IRegisterPatient {
    name: string;
    email: string;
    password: string;
}

const registerPaitent = async (payload: IRegisterPatient) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    //   needPasswordChange: false,
    //   role: Role.PATIENT,
    }
  });

  if(!data.user){
    // throw new Error("Failed to register a patient");
    throw new AppError(status.BAD_REQUEST,"Failed to register a patient");
  }
  try{
   
  const patient = await prisma.$transaction(async(tx)=>{
        const patientTx =await tx.patient.create({
          data:{
            userId: data.user.id,
            name: payload.name,
            email:payload.email,
          }
        });

        return patientTx;
  });


  return {
    ...data,
    patient
  };
  }catch(error:any){
     console.error("Transaction error", error);
     await prisma.user.delete({
      where:{
        id:data.user.id
      }
     });
     throw error;
  }
};

//login user

interface ILoginUserPayload {
   email: string;
   password: string;
}

const loginUser = async(payload:ILoginUserPayload)=>{
  const {email, password} = payload
    const data = await auth.api.signInEmail({
      body:{
        email:email, 
        password: password
      }
    });

    if(data?.user.status === UserStatus.BLOCKED){
          throw new AppError(status.FORBIDDEN,"User is blocked")
    }

    if(data?.user?.isDeleted || data?.user?.status === UserStatus.DELETED){
      throw new AppError(status.NOT_FOUND,"User is deleted")
    }
    //generate access token
    const accessToken = tokenUtils.getAccessToken({
      userId: data?.user?.id,
      role: data?.user?.role,
      name: data?.user?.name,
      email: data?.user?.email,
      status: data?.user?.status,
      isDeleted: data?.user?.isDeleted,
      emailVerified: data?.user?.emailVerified
    })

    //generate refresh token
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data?.user?.id,
      role: data?.user?.role,
      name: data?.user?.name,
      email: data?.user?.email,
      status: data?.user?.status,
      isDeleted: data?.user?.isDeleted,
      emailVerified: data?.user?.emailVerified
    })

    return {
      ...data,
      accessToken,
      refreshToken
    };
}


export const authService = {
    registerPaitent,
    loginUser
}