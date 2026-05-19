import express from "express";
import passport from "passport";
import { body } from "express-validator";
import {
  forgotPassword,
  getMe,
  googleCallback,
  login,
  register,
  resendVerification,
  resetPassword,
  toggleFavoriteVehicle,
  updateProfile,
  verifyEmail
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
    body("role").optional().isIn(["renter", "owner"])
  ],
  validate,
  register
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  login
);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?oauth=failed" }),
  googleCallback
);

router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.post("/forgot-password", [body("email").isEmail().normalizeEmail()], validate, forgotPassword);
router.post(
  "/reset-password",
  [body("token").notEmpty(), body("password").isLength({ min: 8 })],
  validate,
  resetPassword
);
router.post("/verify-email", [body("token").notEmpty()], validate, verifyEmail);
router.post("/resend-verification", protect, resendVerification);
router.post("/favorites/:vehicleId", protect, toggleFavoriteVehicle);

export default router;
