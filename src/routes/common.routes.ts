// src/config/multer.ts
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import express from "express";
import fs from "fs";
import { createCommonData, getAllBilling, getAllFlat, getAllGeneral, getAllPlot, getByIdBilling, getByIdFlat, getByIdGeneral, getByIdPlot, UpdateCommonData, uploadImages } from "../controllers/common.controller";

let router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.array("files"), uploadImages);
router.post("/create/all", createCommonData)
router.put("/update/all", UpdateCommonData)
router.get("/general/get/all", getAllGeneral)
router.get("/general/get/:id", getByIdGeneral)
router.get("/plot/get/all", getAllPlot)
router.get("/plot/get/:id", getByIdPlot)
router.get("/flat/get/all", getAllFlat)
router.get("/flat/get/:id", getByIdFlat)
router.get("/billing/get/all", getAllBilling)
router.get("/billing/get/:id", getByIdBilling)

export default router;