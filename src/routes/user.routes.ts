import express from "express";
import { createAdminUser, createUserByAdmin, deleteUser, getAllUser, getByIdUser, getUserByToken, login, updateUserByAdmin } from "../controllers/user.controller";
import verifyToken from "../middleware/verfiyToken";
import isAdmin from "../middleware/admin";
const router = express.Router();

router.post("/admin/create",createAdminUser);
router.post("/create", createUserByAdmin);
router.post("/login", login);
router.put("/update", updateUserByAdmin);
router.get("/get/by/token",verifyToken, getUserByToken);
router.get("/get/all", getAllUser);
router.get("/get/:id", getByIdUser);
router.delete("/delete" , deleteUser);

export default router;
