import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    description: String,
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage"
    },
    value: {
      type: Number,
      required: true
    },
    maxDiscount: Number,
    expiresAt: Date,
    usageLimit: Number,
    usedCount: {
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

export default mongoose.model("Coupon", couponSchema);
