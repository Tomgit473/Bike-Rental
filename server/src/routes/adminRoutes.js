import express from "express";
import {
  getAdminDashboard,
  listDisputes,
  listUsers,
  listVehicleModerationQueue,
  moderateVehicle,
  updateDispute,
  updateUserStatus
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/analytics", getAdminDashboard);
router.get("/users", listUsers);
router.patch("/users/:id", updateUserStatus);
router.get("/vehicles", listVehicleModerationQueue);
router.patch("/vehicles/:id/moderate", moderateVehicle);
router.get("/disputes", listDisputes);
router.patch("/disputes/:id", updateDispute);

export default router;
