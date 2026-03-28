import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SpecialtyService } from "./specialty.service";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body, icon: req.file?.path };
  const result = await SpecialtyService.createSpecialty(payload);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Specialty created successfully",
    data:result
  });
});

//get all specialty

const getAllSpecialty = catchAsync(async (req: Request, res: Response) => {
  const specialties = await SpecialtyService.getAllSpecialty();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Specialty retrieved successfully",
    data: specialties,
  });
});

//delete specialty

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialtyService.deleteSpecialty(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

//update specialty

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await SpecialtyService.updateSpecialty(id as string, payload);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Specialty updated successfully",
    data: result,
  });
});

export const SpecialtyController = {
  createSpecialty,
  getAllSpecialty,
  deleteSpecialty,
  updateSpecialty,
};
