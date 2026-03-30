import express, { Application, NextFunction, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { IndexRoute } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFount } from "./app/middleware/notFoundRoute";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { envVars } from "./config/env";
import qs from "qs";
import { PaymentController } from "./app/module/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/module/appointment/appointment.service";
const app: Application = express();
export const port = 5000;

//package to parse query string
app.use("query parser", (str: string) => qs.parse(str));

//middleware to redirect page for google signin or signup
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

//stripe webhook payment route
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);
app.use(
  cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//google singin api

app.use("/api/auth", toNodeHandler(auth));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

//node cron to cancel unpaid appointment after 30 minutes
cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("Running cron job to cancel unpaid appointment....");
    await AppointmentService.cancelUnpaidAppointments();
  } catch (err) {
    console.error("Error running cron job:", err);
  }
});

//specailty route

app.use("/api/v1", IndexRoute);

app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: `server is running on port: ${port}`,
  });
});

//global error handler
app.use(globalErrorHandler);

//not found route

app.use(notFount);

export default app;
