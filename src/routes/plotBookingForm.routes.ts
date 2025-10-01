// routes/plotBookingForm.routes.ts
import { Request, Router } from "express";
import { createPlotBookingForm, getAllPlotBookingForms } from "../controllers/plotBookingForm.controller";
import multer from "multer";
import path from "path";
import fs from "fs";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import AWS from "aws-sdk";
// import multer from "multer";
// import multerS3 from "multer-s3";

const router = Router();


// let s3 = new AWS.S3({
//   endpoint: process.env.SPACES_ENDPOINT, // e.g. https://nyc3.digitaloceanspaces.com  
//   accessKeyId: process.env.SPACES_KEY,
//   secretAccessKey: process.env.SPACES_SECRET,
// });

// let upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.SPACES_BUCKET as string,
//     acl: "public-read",
//     key: (req, file, cb) => {
//       const uniqueName =
//         Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;
//       cb(null, "plotBookingForm/" + uniqueName);
//     },
//   }),
// });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/plotBookingForm"); // ensure this folder exists
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const storage = multer.diskStorage({
//   destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
//     const uploadPath = "uploads/general";
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });


// const s3 = new S3Client({
//   region: "us-east-1",
//   endpoint: process.env.SPACES_ENDPOINT,
//   credentials: {
//     accessKeyId: process.env.SPACES_KEY!,
//     secretAccessKey: process.env.SPACES_SECRET!,
//   },
// });

// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.SPACES_BUCKET!,
//     acl: "public-read",
//     key: (req, file, cb) => {
//       const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;
//       cb(null, "plotBookingForm/" + uniqueName);
//     },
//   }),
// });


// const upload = multer({ storage })

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/create", upload.single("photo"),  createPlotBookingForm);
router.get("/get/all", getAllPlotBookingForms);

export default router;
