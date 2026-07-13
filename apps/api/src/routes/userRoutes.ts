import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getMe, updateMe, myTasks } from "../controllers/userController";

const router = Router();

router.use(requireAuth);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.get("/me/tasks", myTasks);

export default router;
