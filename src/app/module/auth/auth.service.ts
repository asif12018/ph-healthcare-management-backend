import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";


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
    refreshToken,
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

//get user own profile

const getMe = async(user:IRequestUser)=>{
    //check if the user exist or not
    const isUserExist = await prisma.user.findUnique({
      where:{
        id: user.userId
      },
      include: {
        patient: {
          include:{
            appointments: true,
            reviews: true,
            prescriptions: true,
            medicalReports: true,
            patientHealthData: true
          }
        },
        doctor: {
          include:{
            specialties: true,
            appointments: true,
            reviews: true,
            prescriptions: true
          }
        },
        admin: true
      }
    });

    if(!isUserExist){
      throw new AppError(status.NOT_FOUND,"User not found")
    }

    return isUserExist;
}


export const authService = {
    registerPaitent,
    loginUser,
    getMe
}