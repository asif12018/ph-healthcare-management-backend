import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import {
  IChangePasswordPayload,
  ILoginUserPayload,
  IRegisterPatient,
} from "./auth.interface";

const registerPaitent = async (payload: IRegisterPatient) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      //   needPasswordChange: false,
      //   role: Role.PATIENT,
    },
  });

  if (!data.user) {
    // throw new Error("Failed to register a patient");
    throw new AppError(status.BAD_REQUEST, "Failed to register a patient");
  }
  try {
    const patient = await prisma.$transaction(async (tx) => {
      const patientTx = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
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
      emailVerified: data?.user?.emailVerified,
    });

    //generate refresh token
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data?.user?.id,
      role: data?.user?.role,
      name: data?.user?.name,
      email: data?.user?.email,
      status: data?.user?.status,
      isDeleted: data?.user?.isDeleted,
      emailVerified: data?.user?.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
      patient,
    };
  } catch (error: any) {
    console.error("Transaction error", error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

//login user

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email: email,
      password: password,
    },
  });

  if (data?.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data?.user?.isDeleted || data?.user?.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }
  //generate access token
  const accessToken = tokenUtils.getAccessToken({
    userId: data?.user?.id,
    role: data?.user?.role,
    name: data?.user?.name,
    email: data?.user?.email,
    status: data?.user?.status,
    isDeleted: data?.user?.isDeleted,
    emailVerified: data?.user?.emailVerified,
  });

  //generate refresh token
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data?.user?.id,
    role: data?.user?.role,
    name: data?.user?.name,
    email: data?.user?.email,
    status: data?.user?.status,
    isDeleted: data?.user?.isDeleted,
    emailVerified: data?.user?.emailVerified,
  });

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

//get user own profile

const getMe = async (user: IRequestUser) => {
  //check if the user exist or not
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      patient: {
        include: {
          appointments: true,
          reviews: true,
          prescriptions: true,
          medicalReports: true,
          patientHealthData: true,
        },
      },
      doctor: {
        include: {
          specialties: true,
          appointments: true,
          reviews: true,
          prescriptions: true,
        },
      },
      admin: true,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExist;
};

//funtion to get new refresh token if the access token expired

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionTokenExist = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExist) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  //verify the refresh token
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );
  if (!verifiedRefreshToken.success && verifiedRefreshToken.err) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data?.userId,
    role: data?.role,
    name: data?.name,
    email: data?.email,
    status: data?.status,
    isDeleted: data?.isDeleted,
    emailVerified: data?.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data?.userId,
    role: data?.role,
    name: data?.name,
    email: data?.email,
    status: data?.status,
    isDeleted: data?.isDeleted,
    emailVerified: data?.emailVerified,
  });

  //update the session token

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};

// change user password

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  // console.log("this is session", session);

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  // console.log("this is payload", payload);
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  // after changing the password the needPasswordChange will be false
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  //generate access token
  const accessToken = tokenUtils.getAccessToken({
    userId: session?.user?.id,
    role: session?.user?.role,
    name: session?.user?.name,
    email: session?.user?.email,
    status: session?.user?.status,
    isDeleted: session?.user?.isDeleted,
    emailVerified: session?.user?.emailVerified,
  });

  //generate refresh token
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session?.user?.id,
    role: session?.user?.role,
    name: session?.user?.name,
    email: session?.user?.email,
    status: session?.user?.status,
    isDeleted: session?.user?.isDeleted,
    emailVerified: session?.user?.emailVerified,
  });

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

//logout user

const logOutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

//verify email

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
};

//forget password

const forgetPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!isUserExist) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

//reset password
const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!isUserExist) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email not verified");
  }

  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

 

  //function to reset password
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

   // after changing the password the needPasswordChange will be false
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  //deleting the session || logingout from all device
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id,
    },
  });
};


//google login

// const googleLogin = async () => {
//   const result = await auth.api.signInWithGoogle();
//   return result;
// };

const googleLoginSuccess = async (session : Record<string, any>) =>{
    const isPatientExists = await prisma.patient.findUnique({
        where : {
            userId : session.user.id,
        }
    })

    if(!isPatientExists){
        await prisma.patient.create({
            data : {
                userId : session.user.id,
                name : session.user.name,
                email : session.user.email,
            }
        
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    return {
        accessToken,
        refreshToken,
    }
}




export const authService = {
  registerPaitent,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess
};
