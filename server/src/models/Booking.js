import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rentalType: {
      type: String,
      enum: ["hourly", "daily", "weekly"],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    actualReturnDate: Date,
    pickupLocation: {
      address: String,
      coordinates: [Number]
    },
    returnLocation: {
      address: String,
      coordinates: [Number]
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled", "rejected"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "authorized", "paid", "refunded", "partially_refunded", "failed"],
      default: "unpaid"
    },
    priceBreakdown: {
      base: Number,
      durationUnits: Number,
      durationHours: Number,
      securityDeposit: Number,
      taxes: Number,
      platformFee: Number,
      lateFee: {
        type: Number,
        default: 0
      },
      discount: {
        type: Number,
        default: 0
      },
      total: Number,
      currency: {
        type: String,
        default: "INR"
      }
    },
    couponCode: String,
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reason: String,
      fee: Number,
      cancelledAt: Date
    },
    renterNotes: String,
    ownerNotes: String,
    extensionRequests: [
      {
        requestedEndDate: Date,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending"
        },
        additionalAmount: Number,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1, status: 1 });
bookingSchema.index({ renter: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
