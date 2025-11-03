import express from "express";
import { getAllLogs } from "../controllers/log.Controller";
const router = express.Router();

router.get("/get/all", getAllLogs);

export default router;
