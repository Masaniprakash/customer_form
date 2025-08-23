import express from "express";
import { createRole, deleteRole, getAllRole, getByIdRole, updateRole } from "../controllers/role.controller";
const router = express.Router();

router.post("/create", createRole);
router.put("/update", updateRole);
router.get("/get/all", getAllRole);
router.get("/get/:id", getByIdRole);
router.delete("/delete", deleteRole);

export default router;
