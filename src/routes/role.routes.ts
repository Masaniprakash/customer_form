import express from "express";
import { createRole, deleteRole, getAllRole, getByIdRole, updateRole } from "../controllers/role.controller";
import verifyToken from "../middleware/verfiyToken";
import isAdmin from "../middleware/admin";
const router = express.Router();

router.post("/create",[verifyToken,isAdmin], createRole);
router.put("/update",[verifyToken,isAdmin], updateRole);
router.get("/get/all", getAllRole);
router.get("/get/:id", getByIdRole);
router.delete("/delete",[verifyToken,isAdmin], deleteRole);

export default router;
