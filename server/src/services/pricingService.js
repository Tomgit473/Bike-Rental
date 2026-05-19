import Booking from "../models/Booking.js";
import Coupon from "../models/Coupon.js";
import ApiError from "../utils/apiError.js";

const currency = "INR";

export const getDuration = (startDate, endDate, rentalType) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const ms = end.getTime() - start.getTime();

  if (Number.isNaN(ms) || ms <= 0) {
    throw new ApiError(400, "Return time must be after pickup time.");
  }

  const durationHours = Math.ceil(ms / (1000 * 60 * 60));
  const divisor = rentalType === "weekly" ? 24 * 7 : rentalType === "daily" ? 24 : 1;
  const durationUnits = Math.max(1, Math.ceil(durationHours / divisor));

  return { durationHours, durationUnits };
};

export const calculateBookingPrice = async ({ vehicle, startDate, endDate, rentalType, couponCode }) => {
  const { durationHours, durationUnits } = getDuration(startDate, endDate, rentalType);
  const rateKey = rentalType === "weekly" ? "week" : rentalType === "daily" ? "day" : "hour";
  const base = Number(vehicle.pricing[rateKey] || 0) * durationUnits;
  const platformFee = Math.round(base * 0.05);
  const taxes = Math.round((base + platformFee) * 0.18);
  const securityDeposit = Number(vehicle.securityDeposit || 0);
  let discount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }]
    });

    if (coupon) {
      discount =
        coupon.discountType === "fixed" ? coupon.value : Math.round((base * coupon.value) / 100);

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }
  }

  const total = Math.max(0, base + platformFee + taxes + securityDeposit - discount);

  return {
    base,
    durationUnits,
    durationHours,
    securityDeposit,
    taxes,
    platformFee,
    lateFee: 0,
    discount,
    total,
    currency
  };
};

export const calculateLateFee = ({ vehicle, expectedEndDate, actualReturnDate }) => {
  const expected = new Date(expectedEndDate);
  const actual = new Date(actualReturnDate);

  if (actual <= expected) return 0;

  const lateHours = Math.ceil((actual.getTime() - expected.getTime()) / (1000 * 60 * 60));
  return Math.round(lateHours * Number(vehicle.pricing.hour || 0) * 1.5);
};

export const assertNoBookingOverlap = async ({ vehicleId, startDate, endDate, excludeBookingId }) => {
  const query = {
    vehicle: vehicleId,
    status: { $in: ["pending", "confirmed", "active"] },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlap = await Booking.exists(query);

  if (overlap) {
    throw new ApiError(409, "Vehicle is already booked for the selected time.");
  }
};
