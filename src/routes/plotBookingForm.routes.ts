// routes/plotBookingForm.routes.ts
import { Request, Router } from "express";
import { createPlotBookingForm, getAllPlotBookingForms } from "../controllers/plotBookingForm.controller";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/plotBookingForm"); // ensure this folder exists
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

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

const upload = multer({ storage })

router.post("/create", upload.single("photo"),  createPlotBookingForm);
router.get("/get/all", getAllPlotBookingForms);

export default router;
