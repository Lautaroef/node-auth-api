import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { profileController } from "../controllers/profileController";

const router = Router();

router.get("/profile", authMiddleware, (req, res) => profileController.getProfile(req, res));

export default router;
