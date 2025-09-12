// src/config/multer.ts
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import express from "express";
import fs from "fs";
import { commonCreate } from "../controllers/common.controller";

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

router.post("/create",uploadGeneralDocs.fields([
    { name: "saleDeedDoc", maxCount: 1 },
    { name: "motherDoc", maxCount: 1 },
]), commonCreate);

export default router;