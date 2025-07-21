import express from "express";
import { createProject, deleteProject, getAllProject, getByIdProject, updateProject } from "../controllers/project.controller";
const router = express.Router();

router.post("/create", createProject);
router.put("/update", updateProject);
router.get("/get/all", getAllProject);
router.get("/get/:id", getByIdProject);
router.delete("/delete", deleteProject);

export default router;
