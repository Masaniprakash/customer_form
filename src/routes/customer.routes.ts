import express from "express";
import { createCustomer, getAllCustomer, getByIdCustomer, updateCustomer } from "../controllers/customer.controller";
const router = express.Router();

router.post("/create", createCustomer);
router.put("/update", updateCustomer);
router.get("/get/all", getAllCustomer);
router.get("/get/:id", getByIdCustomer);

export default router;
