import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../../config/env";
import ms, { type StringValue } from "ms";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import { env } from "node:process";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  //social provider || login with social media
  socialProviders:{
    google:{
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      // callbackURL: envVars.GOOGLE_CALLBACK_URL,
      mapProfileToUser: () =>{
        return {
          role: Role.PATIENT,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null
        }
      }
    }
  },
  
  //email verificaiton
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  //addictional fields for user
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: Role.PATIENT,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },
  plugins: [
    bearer(),
    //plugins to send email for email verificaiton
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        //checking the type of email verification
        if (type === "email-verification") {
          const user = await prisma.user.findFirst({
            where: {
              email,
            },
          });
          //checking if the user exist and not verified
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify Your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        }else if(type ="forget-password"){
               const user = await prisma.user.findFirst({
                where:{
                  email
                }
               });
               if(user){
                sendEmail({
                  to:email,
                  subject: "Password Reset OTP",
                  templateName: "otp",
                  templateData:{
                    name: user.name,
                    otp
                  }
                })
               }
          }
      },
      expiresIn: 2 * 60, // valid for 2mins
      otpLength: 6, // otp will be 6 digits long
      

    }),
    
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1day in seconds
    updateAge: 60 * 60 * 60 * 24, // 1day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1day in seconds
    },
  },
  redirectURLs:{
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins:[process.env.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],
  advanced:{
      // disableCSRFCheck: true
      useSecureCookies: false,
      cookies:{
        state:{
          attributes:{
            sameSite: "none",
            secure: true,
            httpOnly: true,
            path:"/"
          }
        }
      },
      sessionToken:{
        attributes:{
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path:"/"
        }
      }
  }
});
