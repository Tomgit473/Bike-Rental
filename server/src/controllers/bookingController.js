import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import AvailabilitySchedule from "../models/AvailabilitySchedule.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateInvoiceNumber } from "../services/invoiceService.js";
import {
  assertNoBookingOverlap,
  calculateBookingPrice,
  calculateLateFee,
  getDuration
} from "../services/pricingService.js";
import { createNotification, emitToUser } from "../services/notificationService.js";
import { detectFraudRisk } from "../services/aiService.js";

const isParticipant = (booking, user) =>
  user.role === "admin" ||
  String(booking.renter?._id || booking.renter) === String(user._id) ||
  String(booking.owner?._id || booking.owner) === String(user._id);

const assertScheduleAllows = async ({ vehicle, startDate, endDate }) => {
  const { durationHours } = getDuration(startDate, endDate, "hourly");
  const maxHours = Number(vehicle.availability.maxDays || 30) * 24;

  if (durationHours < Number(vehicle.availability.minHours || 1)) {
    throw new ApiError(400, `Minimum rental duration is ${vehicle.availability.minHours} hours.`);
  }

  if (durationHours > maxHours) {
    throw new ApiError(400, `Maximum rental duration is ${vehicle.availability.maxDays} days.`);
  }

  const earliestStart = new Date(Date.now() + Number(vehicle.availability.advanceNoticeHours || 0) * 60 * 60 * 1000);
  if (new Date(startDate) < earliestStart) {
    throw new ApiError(400, `This vehicle needs ${vehicle.availability.advanceNoticeHours} hours advance notice.`);
  }

  const schedule = await AvailabilitySchedule.findOne({ vehicle: vehicle._id });
  const selectedStart = new Date(startDate);
  const selectedEnd = new Date(endDate);
  const blocked = schedule?.blockedDates?.some(
    (range) => range.start < selectedEnd && range.end > selectedStart
  );

  if (blocked) {
    throw new ApiError(409, "Vehicle is blocked by the owner for the selected time.");
  }
};

export const createBooking = asyncHandler(async (req, res) => {
  const { vehicleId, startDate, endDate, rentalType = "daily", couponCode, pickupLocation, returnLocation } = req.body;
  const vehicle = await Vehicle.findById(vehicleId).populate("owner", "name email notificationPreferences");

  if (!vehicle || !vehicle.isActive || vehicle.status !== "approved") {
    throw new ApiError(404, "Vehicle is not available for booking.");
  }

  if (String(vehicle.owner._id || vehicle.owner) === String(req.user._id)) {
    throw new ApiError(400, "Owners cannot book their own vehicle.");
  }

  await assertScheduleAllows({ vehicle, startDate, endDate });
  await assertNoBookingOverlap({ vehicleId: vehicle._id, startDate, endDate });

  const priceBreakdown = await calculateBookingPrice({
    vehicle,
    startDate,
    endDate,
    rentalType,
    couponCode
  });

  const booking = await Booking.create({
    invoiceNumber: generateInvoiceNumber(),
    vehicle: vehicle._id,
    renter: req.user._id,
    owner: vehicle.owner._id || vehicle.owner,
    rentalType,
    startDate,
    endDate,
    pickupLocation,
    returnLocation,
    priceBreakdown,
    couponCode,
    renterNotes: req.body.renterNotes,
    status: vehicle.availability.instantBooking ? "confirmed" : "pending"
  });

  const fraudRisk = detectFraudRisk({ user: req.user, booking, vehicle });

  await Promise.all([
    createNotification({
      user: req.user,
      title: "Booking created",
      message: `Your booking ${booking.invoiceNumber} is ready for payment.`,
      type: "booking",
      data: { bookingId: booking._id }
    }),
    createNotification({
      user: vehicle.owner,
      title: "New rental request",
      message: `${req.user.name} requested ${vehicle.title}.`,
      type: "booking",
      data: { bookingId: booking._id, fraudRisk }
    })
  ]);

  emitToUser(req.app.get("io"), vehicle.owner._id || vehicle.owner, "booking:created", { booking, fraudRisk });

  res.status(201).json({
    success: true,
    booking,
    fraudRisk
  });
});

export const getBookings = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === "admin") {
    if (req.query.status) query.status = req.query.status;
  } else if (req.query.scope === "owner" || req.user.role === "owner") {
    query.owner = req.user._id;
  } else {
    query.renter = req.user._id;
  }

  const bookings = await Booking.find(query)
    .sort({ createdAt: -1 })
    .populate("vehicle", "title category images pickupAddress city pricing")
    .populate("renter", "name avatar phone")
    .populate("owner", "name avatar phone");

  res.json({
    success: true,
    bookings
  });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("vehicle")
    .populate("renter", "name avatar phone email")
    .populate("owner", "name avatar phone email");

  if (!booking) throw new ApiError(404, "Booking not found.");
  if (!isParticipant(booking, req.user)) throw new ApiError(403, "You cannot view this booking.");

  res.json({
    success: true,
    booking
  });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("vehicle").populate("renter").populate("owner");
  if (!booking) throw new ApiError(404, "Booking not found.");

  const canUpdate = req.user.role === "admin" || String(booking.owner._id) === String(req.user._id);
  if (!canUpdate) throw new ApiError(403, "Only the owner or admin can update booking status.");

  const allowed = ["confirmed", "active", "completed", "rejected"];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, "Unsupported booking status.");

  booking.status = req.body.status;
  booking.ownerNotes = req.body.ownerNotes ?? booking.ownerNotes;
  await booking.save();

  await createNotification({
    user: booking.renter,
    title: "Booking updated",
    message: `Booking ${booking.invoiceNumber} is now ${booking.status}.`,
    type: "booking",
    data: { bookingId: booking._id }
  });

  emitToUser(req.app.get("io"), booking.renter._id, "booking:updated", booking);

  res.json({
    success: true,
    booking
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("renter").populate("owner");
  if (!booking) throw new ApiError(404, "Booking not found.");
  if (!isParticipant(booking, req.user)) throw new ApiError(403, "You cannot cancel this booking.");

  if (["completed", "cancelled"].includes(booking.status)) {
    throw new ApiError(400, `Cannot cancel a ${booking.status} booking.`);
  }

  const hoursUntilStart = (new Date(booking.startDate).getTime() - Date.now()) / (1000 * 60 * 60);
  const cancellationFee = hoursUntilStart < 24 ? Math.round((booking.priceBreakdown.base || 0) * 0.15) : 0;

  booking.status = "cancelled";
  booking.cancellation = {
    cancelledBy: req.user._id,
    reason: req.body.reason,
    fee: cancellationFee,
    cancelledAt: new Date()
  };
  await booking.save();

  await Promise.all([
    createNotification({
      user: booking.renter,
      title: "Booking cancelled",
      message: `Booking ${booking.invoiceNumber} has been cancelled.`,
      type: "booking",
      data: { bookingId: booking._id, cancellationFee }
    }),
    createNotification({
      user: booking.owner,
      title: "Booking cancelled",
      message: `Booking ${booking.invoiceNumber} has been cancelled.`,
      type: "booking",
      data: { bookingId: booking._id, cancellationFee }
    })
  ]);

  res.json({
    success: true,
    booking
  });
});

export const requestExtension = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("vehicle");
  if (!booking) throw new ApiError(404, "Booking not found.");
  if (String(booking.renter) !== String(req.user._id) && req.user.role !== "admin") {
    throw new ApiError(403, "Only the renter can request an extension.");
  }

  const requestedEndDate = new Date(req.body.requestedEndDate);

  await assertNoBookingOverlap({
    vehicleId: booking.vehicle._id,
    startDate: booking.endDate,
    endDate: requestedEndDate,
    excludeBookingId: booking._id
  });

  const additional = await calculateBookingPrice({
    vehicle: booking.vehicle,
    startDate: booking.endDate,
    endDate: requestedEndDate,
    rentalType: booking.rentalType
  });

  booking.extensionRequests.push({
    requestedEndDate,
    status: "pending",
    additionalAmount: additional.total
  });
  await booking.save();

  res.json({
    success: true,
    booking
  });
});

export const completeReturn = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("vehicle").populate("renter").populate("owner");
  if (!booking) throw new ApiError(404, "Booking not found.");

  const canComplete = req.user.role === "admin" || String(booking.owner._id) === String(req.user._id);
  if (!canComplete) throw new ApiError(403, "Only the owner or admin can complete the return.");

  const actualReturnDate = req.body.actualReturnDate || new Date();
  const lateFee = calculateLateFee({
    vehicle: booking.vehicle,
    expectedEndDate: booking.endDate,
    actualReturnDate
  });

  booking.status = "completed";
  booking.actualReturnDate = actualReturnDate;
  booking.priceBreakdown.lateFee = lateFee;
  booking.priceBreakdown.total += lateFee;
  await booking.save();

  booking.vehicle.tripsCompleted += 1;
  await booking.vehicle.save();

  await createNotification({
    user: booking.renter,
    title: "Trip completed",
    message: lateFee
      ? `Your trip is complete. A late return fee of ${lateFee} has been added.`
      : "Your trip is complete. Thanks for riding with RideLoop.",
    type: "booking",
    data: { bookingId: booking._id, lateFee }
  });

  res.json({
    success: true,
    booking
  });
});
