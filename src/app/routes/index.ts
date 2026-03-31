import { Router } from "express";
import { SpecialtyRoute } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";

import { AdminRoutes } from "../module/admin/admin.route";
import { scheduleRoutes } from "../module/schedule/schedule.routes";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.routes";
import { AppointmentRoutes } from "../module/appointment/appointment.routes";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { PatientRoutes } from "../module/patient/patient.routes";
import { PrescriptionRoutes } from "../module/prescription/prescription.routes";
import { ReviewRoutes } from "../module/review/review.routes";
import { StatsRoutes } from "../module/stats/stats.routes";
import { PaymentRoutes } from "../module/payment/payment.routes";




const router = Router();



// router.use("/specialties", SpecialtyRoute);

// router.use("/auth", AuthRoutes);

// router.use("/users", UserRoutes);

// router.use("/patients", PatientRoutes);

// router.use("/doctors", DoctorRoutes);

// router.use("/admins", AdminRoutes);

// router.use("/schedules", scheduleRoutes);

// router.use("/doctor-schedules", DoctorScheduleRoutes);

// router.use("/appointments", AppointmentRoutes);

// router.use("/prescriptions", PrescriptionRoutes);

router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoute)
router.use("/users", UserRoutes)
router.use("/patients", PatientRoutes)
router.use("/doctors", DoctorRoutes)
router.use("/admins", AdminRoutes)
router.use("/schedules", scheduleRoutes)
router.use("/doctor-schedules", DoctorScheduleRoutes)
router.use("/appointments", AppointmentRoutes)
router.use("/prescriptions", PrescriptionRoutes)
router.use("/reviews", ReviewRoutes)
router.use("/stats", StatsRoutes)
router.use("/payments", PaymentRoutes)


export const IndexRoute = router;