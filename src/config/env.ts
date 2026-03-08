import dotenv from "dotenv";
dotenv.config();



interface EnvConfig{
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
}



const loadEnvVariable = (): EnvConfig=>{
    //check env variables is it exist on .env file
    const requireEnvVariable =["NODE_ENV", "PORT", "DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"];

    requireEnvVariable.forEach((variable)=>{
        if(!process.env[variable]){
            throw new Error(`Enviroment variable ${variable} is required but not set in .env file`)
        }
    });
   return{
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
   }
}


export const envVars = loadEnvVariable();