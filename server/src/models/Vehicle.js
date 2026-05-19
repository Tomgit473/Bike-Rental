import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    publicId: String,
    alt: String
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    number: String,
    imageUrl: String,
    verified: {
      type: Boolean,
      default: false
    },
    expiresAt: Date
  },
  { _id: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      maxlength: 1600
    },
    category: {
      type: String,
      enum: ["bike", "scooter", "e-bike", "car"],
      required: true
    },
    brand: String,
    model: String,
    year: Number,
    registrationNumber: {
      type: String,
      trim: true
    },
    images: [imageSchema],
    pricing: {
      hour: {
        type: Number,
        required: true,
        min: 1
      },
      day: {
        type: Number,
        required: true,
        min: 1
      },
      week: {
        type: Number,
        required: true,
        min: 1
      }
    },
    securityDeposit: {
      type: Number,
      default: 0
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    pickupAddress: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng"],
      required: true
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual"
    },
    helmetAvailable: {
      type: Boolean,
      default: true
    },
    mileageLimitPerDay: {
      type: Number,
      default: 120
    },
    seats: {
      type: Number,
      default: 2
    },
    documents: {
      rc: documentSchema,
      insurance: documentSchema,
      puc: documentSchema
    },
    availability: {
      instantBooking: {
        type: Boolean,
        default: true
      },
      minHours: {
        type: Number,
        default: 2
      },
      maxDays: {
        type: Number,
        default: 30
      },
      advanceNoticeHours: {
        type: Number,
        default: 2
      },
      timezone: {
        type: String,
        default: "Asia/Kolkata"
      }
    },
    rules: [String],
    features: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending"
    },
    rejectionReason: String,
    ratingStats: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    tripsCompleted: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

vehicleSchema.index({ location: "2dsphere" });
vehicleSchema.index({ title: "text", description: "text", brand: "text", model: "text", city: "text" });
vehicleSchema.index({ category: 1, fuelType: 1, status: 1 });

export default mongoose.model("Vehicle", vehicleSchema);
