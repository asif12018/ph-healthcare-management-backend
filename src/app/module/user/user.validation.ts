import z from "zod";
import { Gender } from "../../../generated/prisma/enums";




//create doctor zod validation schema
export const createDoctorZodSchema = z.object({
  password: z
    .string("password is required")
    .min(6, "password is minimul 6 character log")
    .max(20, "password must be maximum 20 character long"),
  doctor: z.object({
    name: z
      .string("Name is required")
      .min(5, "Name must be atleast 5 charaters")
      .max(30, "Name must be atleast 30 charaters"),
    email: z.email("invalid email address"),
    contactNumber: z
      .string("Contact number is required")
      .min(11, "Contact Number must be 11 characters")
      .max(14, "Contact number must be atleast 30 charaters"),
    address: z
      .string("Address is required")
      .min(10, "Address must be at least 10 characters")
      .max(100, "Address must be at most 100 characters")
      .optional(),
    registrationNumber: z.string("Registration number is required"),
    experience: z
      .int("Experince must be an integer")
      .nonnegative("Experience cant be negative number")
      .optional(),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE],
      "Gender must be either male or female",
    ),
    appointmentFee: z
      .number("Appointment fee must be a number")
      .nonnegative("Appointment fee cant be negative"),
    qualification: z
      .string("Qualification is required")
      .min(2, "Qualification must be at least 2 characters")
      .max(50, "Qualification must be at most 50 characters"),
    currentWorkingPlace:z.string("Working place is required"),
    designation: z
      .string("Current working place is required")
      .min(2, "current working place must be at least 2 character long")
      .max(50, "Designation must be at most 50 characters"),
    specialties: z
      .array(z.uuid(), "Specialty must be an array of uuid")
      .min(1, "At least one specialty is required"),
  }),
});