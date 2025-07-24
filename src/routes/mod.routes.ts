import express from "express";
import { createMod, deleteMod, getAllMod, getByIdMod, updateMod } from "../controllers/mod.controller";
const router = express.Router();

router.post("/create", createMod);
router.put("/update", updateMod);
router.get("/get/all", getAllMod);
router.get("/get/:id", getByIdMod);
router.delete("/delete", deleteMod);

export default router;

