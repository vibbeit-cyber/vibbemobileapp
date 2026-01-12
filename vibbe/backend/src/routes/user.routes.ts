import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { getMe } from "../controllers/user.controller";

const router = Router();

router.get("/me", requireAuth, getMe);

export default router;
