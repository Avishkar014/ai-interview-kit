import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getPractice, savePractice, startPractice } from "../controllers/practice.controller.js";

const router = Router();
router.use(authMiddleware);
router.post("/", startPractice);
router.get("/:kitId", getPractice);
router.post("/:kitId", savePractice);
export default router;