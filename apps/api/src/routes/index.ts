import { Router } from "express";
import authRoutes from "./authRoutes";
import boardRoutes from "./boardRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/boards", boardRoutes);
router.use("/users", userRoutes);

export default router;
