import express from "express";
import { createLfc, deleteLfc, getAllLfc, getLfcById, updateLfc } from "../controllers/lfc.controller";
const router = express.Router();

router.post("/create", createLfc);
router.put("/update", updateLfc);
router.get("/get/all", getAllLfc);
router.get("/get/:id", getLfcById);
router.delete("/:id", deleteLfc);

export default router;
