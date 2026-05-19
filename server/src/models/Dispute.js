import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: String,
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "rejected"],
      default: "open"
    },
    resolution: String
  },
  { timestamps: true }
);

export default mongoose.model("Dispute", disputeSchema);
