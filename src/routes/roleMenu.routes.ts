import express from "express";
import { createRoleMenu, createRoleMultiMenuMap, deleteRoleMenu, getAllRoleMenu, getByIdRoleMenu, updateRoleMenu, updateRoleMultiMenuMap } from "../controllers/roleMenu.controller";
import verifyToken from "../middleware/verfiyToken";
import isAdmin from "../middleware/admin";
const router = express.Router();

router.post("/create" , createRoleMenu);
router.post("/multi/create" , createRoleMultiMenuMap);
router.put("/multi/update" , updateRoleMultiMenuMap);
router.put("/update" , updateRoleMenu);
router.get("/get/all", getAllRoleMenu);
router.get("/get/:id", getByIdRoleMenu);
router.delete("/delete" , deleteRoleMenu);

export default router;
