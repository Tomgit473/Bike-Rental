import express from "express";
import { body, param } from "express-validator";
import {
  cancelBooking,
  completeReturn,
  createBooking,
  getBooking,
  getBookings,
  requestExtension,
  updateBookingStatus
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getBookings)
  .post(
    [
      body("vehicleId").isMongoId(),
      body("startDate").isISO8601(),
      body("endDate").isISO8601(),
      body("rentalType").optional().isIn(["hourly", "daily", "weekly"])
    ],
    validate,
    createBooking
  );

router.get("/:id", [param("id").isMongoId()], validate, getBooking);
router.patch(
  "/:id/status",
  [param("id").isMongoId(), body("status").isIn(["confirmed", "active", "completed", "rejected"])],
  validate,
  updateBookingStatus
);
router.patch("/:id/cancel", [param("id").isMongoId()], validate, cancelBooking);
router.post(
  "/:id/extend",
  [param("id").isMongoId(), body("requestedEndDate").isISO8601()],
  validate,
  requestExtension
);
router.patch("/:id/return", [param("id").isMongoId()], validate, completeReturn);

export default router;
