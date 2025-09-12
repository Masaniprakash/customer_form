// routes/plotBookingForm.routes.ts
import { Router } from "express";
import { createPlotBookingForm, getAllPlotBookingForms } from "../controllers/plotBookingForm.controller";

const router = Router();

router.post("/create", createPlotBookingForm);
router.get("/get/all", getAllPlotBookingForms);

export default router;
