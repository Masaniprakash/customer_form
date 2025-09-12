// routes/lifeSaving.routes.ts
import { Router } from "express";
import { createLifeSaving, getAllLifeSaving } from "../controllers/lifeSaving.controller";

const router = Router();

router.post("/create", createLifeSaving);
router.get("/get/all", getAllLifeSaving);

export default router;
