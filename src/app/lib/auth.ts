import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../../config/env";
import ms from "ms";
// If your Prisma file is located elsewhere, you can change the path



export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword:{
        enabled:true
    },
    //addictional fields for user
    user:{
        additionalFields:{
            role:{
                type:"string",
                required: false,
                defaultValue: Role.PATIENT
            },
            status:{
                type: "string",
                required: false,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                required: false,
                defaultValue: false
            },
            isDeleted: {
                type:"boolean",
                required: false,
                defaultValue: false
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            }
        }
    },
    session:{
        expiresIn: Number(ms(Number(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN))),
        updateAge: Number(ms(Number(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE))),
        cookieCache: {
            enabled: true,
            maxAge: Number(ms(Number(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN)))
        }
    }
    // trustedOrigins:[process.env.BETTER_AUTH_URL || "http://localhost:5000"],
    // advanced:{
    //     disableCSRFCheck: true
    // }
});