// src/config/multer.ts
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import express from "express";
import fs from "fs";
import { checkEmi, createBilling, createCommonData, getAllBilling, getAllDataBasedOnGeneral, getAllDetailsByCustomerId, getAllEmi, getAllFlat, getAllGeneral, getAllMarketer, getAllPlot, getByIdBilling, getByIdEmi, getByIdFlat, getByIdGeneral, getByIdMarketer, getByIdPlot, getDataBasedOnGeneralById, UpdateCommonData, uploadImages } from "../controllers/common.controller";

let router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.array("files"), uploadImages);
router.post("/create/all", createCommonData)
router.post("/create/billing", createBilling)
router.put("/update/all", UpdateCommonData)
router.get("/general/get/all", getAllGeneral)
router.get("/general/get/:id", getByIdGeneral)
router.get("/plot/get/all", getAllPlot)
router.get("/plot/get/:id", getByIdPlot)
router.get("/flat/get/all", getAllFlat)
router.get("/flat/get/:id", getByIdFlat)
router.get("/billing/get/all", getAllBilling)
router.get("/billing/get/:id", getByIdBilling)
router.get("/emi/get/all", getAllEmi)
router.get("/emi/get/:id", getByIdEmi)
router.get("/marketer/get/all", getAllMarketer)
router.get("/marketer/get/:id", getByIdMarketer)
router.get("/get/all/detail", getAllDetailsByCustomerId)
router.get("/get/all/estimate", getAllDataBasedOnGeneral)
router.get("/get/all/estimate/:id", getDataBasedOnGeneralById)
router.post("/check/emi", checkEmi)

export default router;