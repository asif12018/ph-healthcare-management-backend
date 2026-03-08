import { Router } from "express";
import { SpecialtyRoute } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";




const router = Router();



router.use("/specialties", SpecialtyRoute);

router.use("/auth", AuthRoutes);

router.use("/users", UserRoutes);

router.use("/doctors", DoctorRoutes);



export const IndexRoute = router;