import { Router } from "express";
import { listQuestions } from "../controllers/questions.controller.js";

const router = Router();
router.get("/", listQuestions);
export default router;