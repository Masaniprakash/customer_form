// src/config/multer.ts
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import express from "express";
import fs from "fs";
import { commonCreate, createCommonData, getAllBilling, getAllFlat, getAllGeneral, getAllPlot, getByIdBilling, getByIdFlat, getByIdGeneral, getByIdPlot, UpdateCommonData, uploadImages } from "../controllers/common.controller";

let router = express.Router();

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = "uploads/general";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadGeneralDocs = multer({ storage });

const multiStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = "uploads/general";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const multiUpload = multer({ storage }).any();

router.post("/image/upload", multiUpload, uploadImages);

router.post("/create",uploadGeneralDocs.fields([
    { name: "saleDeedDoc", maxCount: 1 },
    { name: "motherDoc", maxCount: 1 },
]), commonCreate);

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