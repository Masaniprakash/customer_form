import express from "express";
import { createRoleMenu, deleteRoleMenu, getAllRoleMenu, getByIdRoleMenu, updateRoleMenu } from "../controllers/roleMenu.controller";
import verifyToken from "../middleware/verfiyToken";
import isAdmin from "../middleware/admin";
const router = express.Router();

router.post("/create",[verifyToken,isAdmin], createRoleMenu);
router.put("/update",[verifyToken,isAdmin], updateRoleMenu);
router.get("/get/all", getAllRoleMenu);
router.get("/get/:id", getByIdRoleMenu);
router.delete("/delete",[verifyToken,isAdmin], deleteRoleMenu);

export default router;
