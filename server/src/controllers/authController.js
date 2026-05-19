import crypto from "crypto";
import User from "../models/User.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendToken } from "../utils/generateToken.js";
import { sendEmail } from "../services/emailService.js";

const createExpiringToken = () => ({
  token: crypto.randomBytes(32).toString("hex"),
  expires: new Date(Date.now() + 60 * 60 * 1000)
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = "renter" } = req.body;
  const allowedRole = ["renter", "owner"].includes(role) ? role : "renter";
  const verification = createExpiringToken();

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: allowedRole,
    emailVerificationToken: verification.token,
    emailVerificationExpires: verification.expires
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your RideLoop email",
    text: `Your verification token is ${verification.token}`,
    html: `<p>Use this token to verify your email:</p><p><strong>${verification.token}</strong></p>`
  });

  sendToken(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  sendToken(res, user);
});

export const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Google authentication failed.");

  const tokenPayload = encodeURIComponent(JSON.stringify(req.user.toAuthJSON()));
  const token = encodeURIComponent(
    (await import("../utils/generateToken.js")).generateToken(req.user)
  );

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${tokenPayload}`);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user.toAuthJSON()
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "avatar", "emergencyContact", "notificationPreferences"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  if (["renter", "owner"].includes(req.body.role)) {
    req.user.role = req.body.role;
  }

  await req.user.save();

  res.json({
    success: true,
    user: req.user.toAuthJSON()
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });

  if (user) {
    const reset = createExpiringToken();
    user.passwordResetToken = reset.token;
    user.passwordResetExpires = reset.expires;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Reset your RideLoop password",
      text: `Your password reset token is ${reset.token}`,
      html: `<p>Use this token to reset your password:</p><p><strong>${reset.token}</strong></p>`
    });
  }

  res.json({
    success: true,
    message: "If the email exists, reset instructions have been sent."
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token.");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(res, user);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    emailVerificationToken: req.body.token,
    emailVerificationExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired email verification token.");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Email verified successfully."
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) {
    return res.json({ success: true, message: "Email is already verified." });
  }

  const verification = createExpiringToken();
  req.user.emailVerificationToken = verification.token;
  req.user.emailVerificationExpires = verification.expires;
  await req.user.save();

  await sendEmail({
    to: req.user.email,
    subject: "Verify your RideLoop email",
    text: `Your verification token is ${verification.token}`
  });

  res.json({
    success: true,
    message: "Verification email sent."
  });
});

export const toggleFavoriteVehicle = asyncHandler(async (req, res) => {
  const vehicleId = req.params.vehicleId;
  const favorites = req.user.favoriteVehicles.map((item) => String(item));
  const hasFavorite = favorites.includes(vehicleId);

  req.user.favoriteVehicles = hasFavorite
    ? req.user.favoriteVehicles.filter((item) => String(item) !== vehicleId)
    : [...req.user.favoriteVehicles, vehicleId];

  await req.user.save();

  res.json({
    success: true,
    favoriteVehicles: req.user.favoriteVehicles,
    favorited: !hasFavorite
  });
});
