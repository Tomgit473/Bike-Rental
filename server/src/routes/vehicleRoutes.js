import express from "express";
import { body, param } from "express-validator";
import {
  createVehicle,
  deleteVehicle,
  getAvailability,
  getOwnerVehicles,
  getPriceSuggestion,
  getVehicle,
  getVehicles,
  updateAvailability,
  updateVehicle
} from "../controllers/vehicleController.js";
import { authorize, optionalAuth, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", getVehicles);
router.get("/mine", protect, authorize("owner", "admin"), getOwnerVehicles);
router.post("/price-suggestion", protect, authorize("owner", "admin"), getPriceSuggestion);
router.get("/:id", optionalAuth, [param("id").isMongoId()], validate, getVehicle);
router.get("/:id/availability", [param("id").isMongoId()], validate, getAvailability);

router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  upload.array("images", 8),
  [
    body("title").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("category").isIn(["bike", "scooter", "e-bike", "car"]),
    body("fuelType").isIn(["petrol", "diesel", "electric", "hybrid", "cng"]),
    body("pickupAddress").trim().notEmpty()
  ],
  validate,
  createVehicle
);

router.patch(
  "/:id",
  protect,
  authorize("owner", "admin"),
  upload.array("images", 8),
  [param("id").isMongoId()],
  validate,
  updateVehicle
);

router.patch(
  "/:id/availability",
  protect,
  authorize("owner", "admin"),
  [param("id").isMongoId()],
  validate,
  updateAvailability
);

router.delete(
  "/:id",
  protect,
  authorize("owner", "admin"),
  [param("id").isMongoId()],
  validate,
  deleteVehicle
);

export default router;
