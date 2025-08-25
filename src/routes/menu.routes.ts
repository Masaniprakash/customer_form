import express from "express";
import { createMenu, deleteMenu, getAllMenu, getByIdMenu, updateMenu } from "../controllers/menu.controller";
import isAdmin from "../middleware/admin";
import verifyToken from "../middleware/verfiyToken";
const router = express.Router();

router.post("/create" , createMenu);
router.put("/update" , updateMenu);
router.get("/get/all", getAllMenu);
router.get("/get/:id", getByIdMenu);
router.delete("/delete" , deleteMenu);

export default router;
