import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../../config/env";
import ms, { type StringValue } from "ms";
import { bearer } from "better-auth/plugins";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
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
  plugins:[
    bearer()
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1day in seconds
    updateAge: 60 * 60 * 60 * 24, // 1day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1day in seconds
    },
  },
  // trustedOrigins:[process.env.BETTER_AUTH_URL || "http://localhost:5000"],
  // advanced:{
  //     disableCSRFCheck: true
  // }
});
