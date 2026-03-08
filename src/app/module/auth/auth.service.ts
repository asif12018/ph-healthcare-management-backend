import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";


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