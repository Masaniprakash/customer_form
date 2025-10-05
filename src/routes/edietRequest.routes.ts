import express from "express";
import { approvedEditRequest, getAllEditRequest, getByIdEditRequest } from "../controllers/editRequest.controller";
import verifyToken from "../middleware/verfiyToken";
import isAdmin from "../middleware/admin";
const router = express.Router();

router.post("/approve", [verifyToken,isAdmin], approvedEditRequest);
router.get("/get/all", [verifyToken,isAdmin], getAllEditRequest);
router.get("/get/:id", [verifyToken,isAdmin], getByIdEditRequest);


export default router;
