import { auth } from "../../app/lib/auth";
import { prisma } from "../../app/lib/prisma";
import { Role, User, UserStatus } from "../../generated/prisma/client";

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
    throw new Error("Failed to register a patient");
  }

//   const patient = await prisma.$transaction(async(tx)=>{
        
//   })


  return data;
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
          throw new Error("User is blocked")
    }

    if(data?.user?.isDeleted || data?.user?.status === UserStatus.DELETED){
      throw new Error("User is deleted")
    }
    return data;
}


export const authService = {
    registerPaitent,
    loginUser
}