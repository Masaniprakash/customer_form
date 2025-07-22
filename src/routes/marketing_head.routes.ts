import express from "express";
import { createMarketingHead, deleteMarketingHead, getAllMarketingHead, getByIdMarketingHead, updateMarketingHead } from "../controllers/marketing_head.controller";
const router = express.Router();

router.post("/create", createMarketingHead);
router.put("/update", updateMarketingHead);
router.get("/get/all", getAllMarketingHead);
router.get("/get/:id", getByIdMarketingHead);
router.delete("/delete", deleteMarketingHead);

export default router;
