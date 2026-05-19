import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true
    },
    startTime: {
      type: String,
      default: "08:00"
    },
    endTime: {
      type: String,
      default: "22:00"
    }
  },
  { _id: false }
);

const dateRangeSchema = new mongoose.Schema(
  {
    start: Date,
    end: Date,
    reason: String
  },
  { _id: false }
);

const availabilityScheduleSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      unique: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },
    weeklySlots: {
      type: [timeSlotSchema],
      default: () =>
        [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
          dayOfWeek,
          startTime: "08:00",
          endTime: "22:00"
        }))
    },
    blockedDates: [dateRangeSchema],
    specialAvailability: [dateRangeSchema],
    instantBooking: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("AvailabilitySchedule", availabilityScheduleSchema);
