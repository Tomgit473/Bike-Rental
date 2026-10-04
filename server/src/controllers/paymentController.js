import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createRazorpayOrder,
  createStripeIntent,
  verifyRazorpaySignature
} from "../services/paymentService.js";
import { createNotification } from "../services/notificationService.js";

const assertBookingPaymentAccess = (booking, user) => {
  if (user.role !== "admin" && String(booking.renter) !== String(user._id)) {
    throw new ApiError(403, "Only the renter can pay for this booking.");
  }
};

export const createCheckout = asyncHandler(async (req, res) => {
  const { bookingId, provider = "stripe" } = req.body;
  const booking = await Booking.findById(bookingId);

  if (!booking) throw new ApiError(404, "Booking not found.");
  assertBookingPaymentAccess(booking, req.user);

  if (["cancelled", "rejected"].includes(booking.status)) {
    throw new ApiError(400, "Cannot pay for a cancelled or rejected booking.");
  }

  const amount = booking.priceBreakdown.total;
  const currency = booking.priceBreakdown.currency || "INR";

  const existingPaid = await Payment.findOne({ booking: booking._id, status: "captured" });
  if (existingPaid) {
    throw new ApiError(400, "This booking has already been paid.");
  }

  const existingPending = await Payment.findOne({
    booking: booking._id,
    provider,
    status: "created"
  }).sort({ createdAt: -1 });
  if (existingPending) {
    res.status(200).json({
      success: true,
      payment: existingPending,
      providerPayload: existingPending.metadata,
      reused: true
    });
    return;
  }

  let providerPayload;

  if (provider === "razorpay") {
    providerPayload = await createRazorpayOrder({
      amount,
      currency,
      receipt: booking.invoiceNumber,
      notes: { bookingId: String(booking._id) }
    });
  } else {
    providerPayload = await createStripeIntent({
      amount,
      currency,
      metadata: { bookingId: String(booking._id), invoiceNumber: booking.invoiceNumber }
    });
  }

  const payment = await Payment.create({
    booking: booking._id,
    user: req.user._id,
    provider,
    providerOrderId: providerPayload.id,
    amount,
    currency,
    status: "created",
    depositHoldAmount: booking.priceBreakdown.securityDeposit,
    metadata: providerPayload
  });

  res.status(201).json({
    success: true,
    payment,
    providerPayload
  });
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("booking");
  if (!payment) throw new ApiError(404, "Payment not found.");
  if (String(payment.user) !== String(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "You cannot confirm this payment.");
  }

  if (payment.status === "captured") {
    throw new ApiError(400, "This payment has already been captured.");
  }
  if (payment.status === "refunded") {
    throw new ApiError(400, "Cannot confirm a refunded payment.");
  }
  if (["cancelled", "rejected"].includes(payment.booking.status)) {
    throw new ApiError(400, "Cannot pay for a cancelled or rejected booking.");
  }

  if (payment.provider === "razorpay") {
    const valid = verifyRazorpaySignature({
      orderId: req.body.providerOrderId || payment.providerOrderId,
      paymentId: req.body.providerPaymentId,
      signature: req.body.providerSignature
    });

    if (!valid) throw new ApiError(400, "Invalid Razorpay signature.");
  }

  payment.providerPaymentId = req.body.providerPaymentId || payment.providerPaymentId;
  payment.providerSignature = req.body.providerSignature || payment.providerSignature;
  payment.status = "captured";
  await payment.save();

  payment.booking.paymentStatus = "paid";
  if (payment.booking.status === "pending") {
    payment.booking.status = "confirmed";
  }
  await payment.booking.save();

  await createNotification({
    user: req.user,
    title: "Payment successful",
    message: `Payment for booking ${payment.booking.invoiceNumber} has been captured.`,
    type: "payment",
    data: { bookingId: payment.booking._id, paymentId: payment._id }
  });

  res.json({
    success: true,
    payment,
    booking: payment.booking
  });
});

export const listPayments = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { user: req.user._id };
  const payments = await Payment.find(query).sort({ createdAt: -1 }).populate("booking", "invoiceNumber status");

  res.json({
    success: true,
    payments
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("booking");
  if (!payment) throw new ApiError(404, "Payment not found.");

  if (payment.status !== "captured") {
    throw new ApiError(400, "Only a captured payment can be refunded.");
  }

  const refundAmount = Number(req.body.amount ?? payment.amount);
  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    throw new ApiError(400, "Refund amount must be greater than zero.");
  }
  if (refundAmount > payment.amount) {
    throw new ApiError(400, "Refund amount cannot exceed the captured amount.");
  }

  payment.status = "refunded";
  payment.refundAmount = refundAmount;
  await payment.save();

  payment.booking.paymentStatus = refundAmount >= payment.amount ? "refunded" : "partially_refunded";
  await payment.booking.save();

  res.json({
    success: true,
    payment
  });
});
