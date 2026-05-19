import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["booking", "payment", "review", "system", "security", "support"],
      default: "system"
    },
    channels: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    data: mongoose.Schema.Types.Mixed,
    readAt: Date
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
