import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["renter_to_owner", "owner_to_renter"],
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    tripPhotos: [
      {
        url: String,
        publicId: String
      }
    ],
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

reviewSchema.index({ booking: 1, reviewer: 1, type: 1 }, { unique: true });
reviewSchema.index({ vehicle: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
