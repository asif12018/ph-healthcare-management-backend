import { Router } from "express";
import { SpecialtyRoute } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { AdminRoutes } from "../module/admin/admin.route";




const router = Router();



router.use("/specialties", SpecialtyRoute);

router.use("/auth", AuthRoutes);

router.use("/users", UserRoutes);

router.use("/doctors", DoctorRoutes);

router.use("/admins", AdminRoutes)


export const IndexRoute = router;