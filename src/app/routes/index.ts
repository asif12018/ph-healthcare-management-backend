import { Router } from "express";
import { SpecialtyRoute } from "../../module/specialty/specialty.route";
import { AuthRoutes } from "../../module/auth/auth.route";



const router = Router();



router.use("/specialties", SpecialtyRoute);

router.use("/auth", AuthRoutes);



export const IndexRoute = router;