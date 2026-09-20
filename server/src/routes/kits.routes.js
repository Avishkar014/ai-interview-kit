import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createKit, deleteKit, getKit, getKitStatus, getWeakSpots, listKits, updateKit } from "../controllers/kits.controller.js";

const router = Router();
router.use(authMiddleware);
router.post("/", createKit);
router.get("/", listKits);
router.get("/:id/status", getKitStatus);
router.get("/:id/weak-spots", getWeakSpots);
router.get("/:id", getKit);
router.patch("/:id", updateKit);
router.delete("/:id", deleteKit);
export default router;