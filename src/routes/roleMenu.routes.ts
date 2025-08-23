import express from "express";
import { createRoleMenu, deleteRoleMenu, getAllRoleMenu, getByIdRoleMenu, updateRoleMenu } from "../controllers/roleMenu.controller";
const router = express.Router();

router.post("/create", createRoleMenu);
router.put("/update", updateRoleMenu);
router.get("/get/all", getAllRoleMenu);
router.get("/get/:id", getByIdRoleMenu);
router.delete("/delete", deleteRoleMenu);

export default router;
