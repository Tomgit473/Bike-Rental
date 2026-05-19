import Booking from "../models/Booking.js";
import Dispute from "../models/Dispute.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const [users, vehicles, bookings, payments, revenue, bookingTrends, topVehicles] = await Promise.all([
    User.countDocuments(),
    Vehicle.countDocuments(),
    Booking.countDocuments(),
    Payment.countDocuments({ status: "captured" }),
    Payment.aggregate([
      { $match: { status: "captured" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      { $limit: 14 }
    ]),
    Vehicle.find().sort({ tripsCompleted: -1, "ratingStats.average": -1 }).limit(5).select("title category tripsCompleted ratingStats")
  ]);

  res.json({
    success: true,
    analytics: {
      totals: {
        users,
        vehicles,
        bookings,
        payments,
        revenue: revenue[0]?.total || 0
      },
      bookingTrends,
      topVehicles
    }
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search, "i") },
      { email: new RegExp(req.query.search, "i") },
      { phone: new RegExp(req.query.search, "i") }
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).limit(Number(req.query.limit || 100));

  res.json({
    success: true,
    users
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.kycStatus) user.kycStatus = req.body.kycStatus;
  if (req.body.role && ["renter", "owner", "admin"].includes(req.body.role)) user.role = req.body.role;

  await user.save();

  res.json({
    success: true,
    user
  });
});

export const listVehicleModerationQueue = asyncHandler(async (req, res) => {
  const status = req.query.status || "pending";
  const vehicles = await Vehicle.find({ status }).sort({ createdAt: -1 }).populate("owner", "name email phone");

  res.json({
    success: true,
    vehicles
  });
});

export const moderateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found.");

  if (!["approved", "rejected", "suspended"].includes(req.body.status)) {
    throw new ApiError(400, "Status must be approved, rejected, or suspended.");
  }

  vehicle.status = req.body.status;
  vehicle.rejectionReason = req.body.rejectionReason;
  await vehicle.save();

  res.json({
    success: true,
    vehicle
  });
});

export const listDisputes = asyncHandler(async (_req, res) => {
  const disputes = await Dispute.find()
    .sort({ createdAt: -1 })
    .populate("booking", "invoiceNumber status")
    .populate("raisedBy", "name email")
    .populate("assignedAdmin", "name email");

  res.json({
    success: true,
    disputes
  });
});

export const updateDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      resolution: req.body.resolution,
      assignedAdmin: req.user._id
    },
    { new: true, runValidators: true }
  );

  if (!dispute) throw new ApiError(404, "Dispute not found.");

  res.json({
    success: true,
    dispute
  });
});
