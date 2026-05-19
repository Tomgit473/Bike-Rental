import express from "express";
import { body, param } from "express-validator";
import {
  confirmPayment,
  createCheckout,
  listPayments,
  refundPayment
} from "../controllers/paymentController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.get("/", listPayments);
router.post(
  "/checkout",
  [body("bookingId").isMongoId(), body("provider").optional().isIn(["stripe", "razorpay"])],
  validate,
  createCheckout
);
router.patch("/:id/confirm", [param("id").isMongoId()], validate, confirmPayment);
router.patch(
  "/:id/refund",
  authorize("admin"),
  [param("id").isMongoId(), body("amount").optional().isNumeric()],
  validate,
  refundPayment
);

export default router;
