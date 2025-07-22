import express from "express";
import { createMarketDetail, deleteMarketDetail, getAllMarketDetail, getByIdMarketDetail, updateMarketDetail } from "../controllers/marketDetail.controller";
const router = express.Router();

router.post("/create", createMarketDetail);
router.put("/update", updateMarketDetail);
router.get("/get/all", getAllMarketDetail);
router.get("/get/:id", getByIdMarketDetail);
router.delete("/delete", deleteMarketDetail);

export default router;
