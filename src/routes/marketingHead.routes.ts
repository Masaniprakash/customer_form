import express from "express";
import { createMarketingHead, deleteMarketingHead, getAllMarketingHead, getByIdMarketingHead, updateMarketingHead } from "../controllers/marketingHead.controller";
import verifyToken from "../middleware/verfiyToken";
const router = express.Router();

router.post("/create", createMarketingHead);
router.put("/update", verifyToken , updateMarketingHead);
router.get("/get/all", getAllMarketingHead);
router.get("/get/:id", getByIdMarketingHead);
router.delete("/delete", deleteMarketingHead);

export default router;
