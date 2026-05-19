import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Vehicle from "../models/Vehicle.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFiles } from "../services/cloudinaryService.js";

const refreshVehicleRating = async (vehicleId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        vehicle: vehicleId,
        type: "renter_to_owner",
        isVisible: true
      }
    },
    {
      $group: {
        _id: "$vehicle",
        average: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  const ratingStats = stats[0]
    ? { average: Number(stats[0].average.toFixed(1)), count: stats[0].count }
    : { average: 0, count: 0 };

  await Vehicle.findByIdAndUpdate(vehicleId, { ratingStats });
};

export const createReview = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.body.bookingId);
  if (!booking) throw new ApiError(404, "Booking not found.");
  if (booking.status !== "completed") throw new ApiError(400, "Reviews can be added after trip completion.");

  const reviewerId = String(req.user._id);
  const isRenter = String(booking.renter) === reviewerId;
  const isOwner = String(booking.owner) === reviewerId;

  if (!isRenter && !isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You cannot review this booking.");
  }

  const type = isRenter ? "renter_to_owner" : "owner_to_renter";
  const reviewee = isRenter ? booking.owner : booking.renter;
  const photos = await uploadFiles(req.files, "ride-loop/reviews");

  const review = await Review.create({
    booking: booking._id,
    vehicle: booking.vehicle,
    reviewer: req.user._id,
    reviewee,
    type,
    rating: req.body.rating,
    comment: req.body.comment,
    tripPhotos: photos
  });

  if (type === "renter_to_owner") {
    await refreshVehicleRating(booking.vehicle);
  }

  res.status(201).json({
    success: true,
    review
  });
});

export const getVehicleReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    vehicle: req.params.vehicleId,
    isVisible: true,
    type: "renter_to_owner"
  })
    .sort({ createdAt: -1 })
    .populate("reviewer", "name avatar");

  res.json({
    success: true,
    reviews
  });
});
