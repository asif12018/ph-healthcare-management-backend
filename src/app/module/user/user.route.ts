import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";



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

//create admin route

router.post("/create-admin",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    UserController.createAdmin);

export const UserRoutes = router;
