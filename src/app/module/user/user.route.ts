import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";



const router = Router();



router.post(
  "/create-doctor",

  // (req: Request, res: Response, next: NextFunction) => {
  //   const parseResult = createDoctorZodSchema.safeParse(req.body);
  //   if (!parseResult.success) {
  //     return next(parseResult.error);
  //   }

  //   //sanitizing the data
  //   req.body = parseResult.data;
  //   next()
  // },
  validateRequest(createDoctorZodSchema),
  UserController.createDoctor,
);

export const UserRoutes = router;
