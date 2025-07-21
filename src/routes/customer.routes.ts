import express from "express";
import { createCustomer, deleteCustomer, getAllCustomer, getByIdCustomer, updateCustomer } from "../controllers/customer.controller";
const router = express.Router();

router.post("/create", createCustomer);
router.put("/update", updateCustomer);
router.get("/get/all", getAllCustomer);
router.get("/get/:id", getByIdCustomer);
router.delete("/delete", deleteCustomer);

export default router;
