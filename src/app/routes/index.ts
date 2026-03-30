import { Router } from "express";
import { SpecialtyRoute } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";

import { AdminRoutes } from "../module/admin/admin.route";
import { scheduleRoutes } from "../module/schedule/schedule.routes";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.routes";
import { AppointmentRoutes } from "../module/appointment/appointment.routes";
import { DoctorRoutes } from "../module/doctor/doctor.route";




const router = Router();



router.use("/specialties", SpecialtyRoute);

router.use("/auth", AuthRoutes);

router.use("/users", UserRoutes);

router.use("/doctors", DoctorRoutes);

router.use("/admins", AdminRoutes);

router.use("/schedules", scheduleRoutes);

router.use("/doctor-schedules", DoctorScheduleRoutes);

router.use("/appointments", AppointmentRoutes);


export const IndexRoute = router;