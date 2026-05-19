import express from "express";
import { getDashboard, updateKyc } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);
router.patch("/kyc", updateKyc);

export default router;
