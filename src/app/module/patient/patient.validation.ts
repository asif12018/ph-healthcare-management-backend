import z from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

const updatePatienProfileZodSchema = z.object({
  patientInfo: z
    .object({
      name: z
        .string("Name must be a string")
        .min(1, "Name must be at least 1 character long")
        .optional(),
      profilePhoto: z.string().optional(),
      contactNumber: z
        .string("Contact number must be a string")
        .min(1, "Contact number must be at least 1 character long")
        .optional(),
      address: z
        .string("Address must be a string")
        .min(1, "Address must be at least 1 character long")
        .optional(),
    })
    .optional(),
  patientHealthData: z
    .object({
      gender: z.enum([Gender.FEMALE, Gender.MALE, Gender.OTHER]).optional(),
      dateOfBirth: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid date format",
        })
        .optional(),
      bloodGroup: z
        .enum([
          BloodGroup.A_POSITIVE,
          BloodGroup.A_NEGATIVE,
          BloodGroup.B_POSITIVE,
          BloodGroup.B_NEGATIVE,
          BloodGroup.AB_POSITIVE,
          BloodGroup.AB_NEGATIVE,
          BloodGroup.O_POSITIVE,
          BloodGroup.O_NEGATIVE,
        ])
        .optional(),
      hasAllergies: z.boolean().optional(),
      hasDiabetes: z.boolean().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      smokingStatus: z.boolean().optional(),
      dietaryPreferences: z.string().optional(),
      pregnancyStatus: z.boolean().optional(),
      mentalHealthHistory: z.string().optional(),
      immunizationStatus: z.string().optional(),
      hasPastSurgeries: z.boolean().optional(),
      recentAnxiety: z.boolean().optional(),
      recentDepression: z.boolean().optional(),
      maritalStatus: z.string().optional(),
    })
    .optional(),
  medicalReports: z
    .array(
      z.object({
        reportName: z.string().optional(),
        reportLink: z.url().optional(),
        shouldDelete: z.boolean().optional(),
        reportId: z.uuid().optional(),
      }),
    )
    .optional()
    .refine((reports) => {
      if (!reports || reports.length === 0) return true;
      //case 1: if shouldDelete is true then reportId must be present
      for (const report of reports) {
        if (report.shouldDelete === true && !report.reportId) {
          return false;
        }
        //case 2: if reportId is present and shouldDelete is false then reportName and reportLink must be present
        if (report.reportId && !report.shouldDelete) {
          return false;
        }

        //case 3: if reportId is present and shouldDelete is true then reportName and reportLink must not be present
        if (report.reportName && !report.reportLink) {
          return false;
        }

        //case 4: if reportId is present and shouldDelete is true then reportName and reportLink must not be present
        if (report.reportLink && !report.reportName) {
          return false;
        }
        return true;
      }
    },{
        message:"Invalid medical reports"
    }),
});


export const PatientValidation = {
    updatePatienProfileZodSchema
}
