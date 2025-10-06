import express from "express";
import { createCustomer, deleteCustomer, getAllCustomer, getByIdCustomer, updateCustomer } from "../controllers/customer.controller";
import verifyToken from "../middleware/verfiyToken";
const router = express.Router();

router.post("/create", createCustomer);
router.put("/update",verifyToken, updateCustomer);
router.get("/get/all", getAllCustomer);
router.get("/get/:id", getByIdCustomer);
router.delete("/delete", deleteCustomer);

export default router;
