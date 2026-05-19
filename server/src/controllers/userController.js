import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import Payment from "../models/Payment.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const [renterBookings, ownerVehicles, ownerBookings, payments] = await Promise.all([
    Booking.find({ renter: req.user._id }).sort({ createdAt: -1 }).limit(5).populate("vehicle", "title images"),
    Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Booking.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(5).populate("vehicle", "title images"),
    Payment.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5)
  ]);

  const ownerEarnings = ownerBookings
    .filter((booking) => ["paid", "authorized"].includes(booking.paymentStatus))
    .reduce((sum, booking) => sum + Number(booking.priceBreakdown?.base || 0), 0);

  res.json({
    success: true,
    dashboard: {
      renterBookings,
      ownerVehicles,
      ownerBookings,
      payments,
      stats: {
        renterTrips: renterBookings.length,
        listedVehicles: ownerVehicles.length,
        ownerRequests: ownerBookings.length,
        ownerEarnings
      }
    }
  });
});

export const updateKyc = asyncHandler(async (req, res) => {
  if (req.body.aadhaarLast4) {
    req.user.aadhaar = {
      numberLast4: req.body.aadhaarLast4,
      verified: false
    };
  }

  if (req.body.drivingLicenseNumber) {
    req.user.drivingLicense = {
      ...req.user.drivingLicense,
      number: req.body.drivingLicenseNumber,
      expiresAt: req.body.drivingLicenseExpiresAt
    };
  }

  req.user.kycStatus = "pending";
  await req.user.save();

  res.json({
    success: true,
    user: req.user.toAuthJSON()
  });
});
