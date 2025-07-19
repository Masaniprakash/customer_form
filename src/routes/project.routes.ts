import express from "express";
import { createProject, getAllProject, getByIdProject, updateProject } from "../controllers/project.controller";
const router = express.Router();

router.post("/create", createProject);
router.put("/update", updateProject);
router.get("/get/all", getAllProject);
router.get("/get/:id", getByIdProject);

export default router;
