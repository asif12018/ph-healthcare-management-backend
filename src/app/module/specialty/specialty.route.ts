import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();


router.post("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.createSpecialty);
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.getAllSpecialty);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.deleteSpecialty);
router.patch("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.updateSpecialty);


export const SpecialtyRoute = router;
