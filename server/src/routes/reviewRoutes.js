import express from "express";
import { body, param } from "express-validator";
import { createReview, getVehicleReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/vehicle/:vehicleId", [param("vehicleId").isMongoId()], validate, getVehicleReviews);
router.post(
  "/",
  protect,
  upload.array("tripPhotos", 5),
  [body("bookingId").isMongoId(), body("rating").isInt({ min: 1, max: 5 })],
  validate,
  createReview
);

export default router;
