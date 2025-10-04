import express from "express";
import { approvedEditRequest } from "../controllers/editRequest.controller";
import verifyToken from "../middleware/verfiyToken";
import isAdmin from "../middleware/admin";
const router = express.Router();

router.post("/approve", [verifyToken,isAdmin], approvedEditRequest);

export default router;
