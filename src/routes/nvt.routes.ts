import express from "express";
import { createNvt, deleteNvt, getAllNvt, getAllNvtCustomer, getByIdNvt, updateNvt } from "../controllers/nvt.controller";
const router = express.Router();

router.post("/create", createNvt);
router.put("/update", updateNvt);
router.get("/get/all", getAllNvt);
router.get("/get/all/customer/:id", getAllNvtCustomer);
router.get("/get/:id", getByIdNvt);
router.delete("/delete", deleteNvt);

export default router;

