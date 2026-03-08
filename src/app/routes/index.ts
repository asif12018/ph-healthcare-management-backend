import { Router } from "express";
import { SpecialtyRoute } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";




const router = Router();



router.use("/specialties", SpecialtyRoute);

router.use("/auth", AuthRoutes);

router.use("/users", UserRoutes)



export const IndexRoute = router;