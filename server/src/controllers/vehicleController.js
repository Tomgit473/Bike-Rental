import AvailabilitySchedule from "../models/AvailabilitySchedule.js";
import Vehicle from "../models/Vehicle.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { toGeoPoint } from "../utils/geo.js";
import { uploadFiles } from "../services/cloudinaryService.js";
import { suggestRentalPrice } from "../services/aiService.js";

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
};

const toArray = (value) => {
  const parsed = parseMaybeJson(value, value);
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed === "string" && parsed.trim()) return parsed.split(",").map((item) => item.trim());
  return [];
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
};

const buildVehiclePayload = (body) => {
  const pricing = parseMaybeJson(body.pricing, {});
  const documents = parseMaybeJson(body.documents, {});
  const availability = parseMaybeJson(body.availability, {});
  const location =
    parseMaybeJson(body.location, null) ||
    toGeoPoint({
      latitude: body.latitude,
      longitude: body.longitude
    });

  return {
    title: body.title,
    description: body.description,
    category: body.category,
    brand: body.brand,
    model: body.model,
    year: body.year,
    registrationNumber: body.registrationNumber,
    pricing: {
      hour: Number(pricing.hour ?? body.pricePerHour ?? body.hour),
      day: Number(pricing.day ?? body.pricePerDay ?? body.day),
      week: Number(pricing.week ?? body.pricePerWeek ?? body.week)
    },
    securityDeposit: Number(body.securityDeposit || 0),
    location,
    pickupAddress: body.pickupAddress,
    city: body.city,
    state: body.state,
    fuelType: body.fuelType,
    transmission: body.transmission,
    helmetAvailable: toBoolean(body.helmetAvailable, true),
    mileageLimitPerDay: Number(body.mileageLimitPerDay || body.mileageLimit || 120),
    seats: Number(body.seats || 2),
    documents,
    availability: {
      instantBooking: toBoolean(availability.instantBooking ?? body.instantBooking, true),
      minHours: Number(availability.minHours ?? body.minHours ?? 2),
      maxDays: Number(availability.maxDays ?? body.maxDays ?? 30),
      advanceNoticeHours: Number(availability.advanceNoticeHours ?? body.advanceNoticeHours ?? 2),
      timezone: availability.timezone ?? body.timezone ?? "Asia/Kolkata"
    },
    rules: toArray(body.rules),
    features: toArray(body.features)
  };
};

const assertVehicleAccess = (vehicle, user) => {
  const ownsVehicle = String(vehicle.owner) === String(user._id) || String(vehicle.owner?._id) === String(user._id);

  if (!ownsVehicle && user.role !== "admin") {
    throw new ApiError(403, "You can only modify your own listings.");
  }
};

export const createVehicle = asyncHandler(async (req, res) => {
  const payload = buildVehiclePayload(req.body);
  const uploadedImages = await uploadFiles(req.files, "ride-loop/vehicles");

  const vehicle = await Vehicle.create({
    ...payload,
    owner: req.user._id,
    images: uploadedImages.length ? uploadedImages : undefined,
    status: req.user.role === "admin" ? "approved" : "pending"
  });

  await AvailabilitySchedule.create({
    vehicle: vehicle._id,
    owner: req.user._id,
    timezone: vehicle.availability.timezone,
    instantBooking: vehicle.availability.instantBooking
  });

  res.status(201).json({
    success: true,
    vehicle
  });
});

export const getVehicles = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    fuelType,
    minPrice,
    maxPrice,
    rating,
    latitude,
    longitude,
    distance = 25,
    sort = "recommended",
    rentalType = "day",
    page = 1,
    limit = 12
  } = req.query;

  const query = {
    isActive: true,
    status: "approved"
  };

  if (search) query.$text = { $search: search };
  if (category) query.category = { $in: String(category).split(",") };
  if (fuelType) query.fuelType = { $in: String(fuelType).split(",") };
  if (rating) query["ratingStats.average"] = { $gte: Number(rating) };

  const priceKey = rentalType === "hourly" ? "pricing.hour" : rentalType === "weekly" ? "pricing.week" : "pricing.day";
  if (minPrice || maxPrice) {
    query[priceKey] = {};
    if (minPrice) query[priceKey].$gte = Number(minPrice);
    if (maxPrice) query[priceKey].$lte = Number(maxPrice);
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasLocation = !Number.isNaN(lat) && !Number.isNaN(lng);
  const countQuery = { ...query };

  if (hasLocation) {
    const maxDistanceMeters = Number(distance) * 1000;
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistanceMeters
      }
    };
    countQuery.location = {
      $geoWithin: {
        $centerSphere: [[lng, lat], Number(distance) / 6378.1]
      }
    };
  }

  const sortMap = {
    price_low: { [priceKey]: 1 },
    price_high: { [priceKey]: -1 },
    rating: { "ratingStats.average": -1, "ratingStats.count": -1 },
    newest: { createdAt: -1 },
    recommended: { "ratingStats.average": -1, tripsCompleted: -1 }
  };

  const skip = (Number(page) - 1) * Number(limit);
  const sortOption = hasLocation ? undefined : sortMap[sort] || sortMap.recommended;

  const [vehicles, total] = await Promise.all([
    Vehicle.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate("owner", "name avatar trustedScore kycStatus")
      .lean(),
    Vehicle.countDocuments(countQuery)
  ]);

  res.json({
    success: true,
    vehicles,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

export const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate("owner", "name avatar phone trustedScore kycStatus");

  if (!vehicle) throw new ApiError(404, "Vehicle not found.");

  const canViewDraft =
    req.user &&
    (req.user.role === "admin" || String(vehicle.owner._id || vehicle.owner) === String(req.user._id));

  if ((vehicle.status !== "approved" || !vehicle.isActive) && !canViewDraft) {
    throw new ApiError(404, "Vehicle not found.");
  }

  const schedule = await AvailabilitySchedule.findOne({ vehicle: vehicle._id });

  res.json({
    success: true,
    vehicle,
    schedule
  });
});

export const getOwnerVehicles = asyncHandler(async (req, res) => {
  const ownerId = req.user.role === "admin" && req.query.owner ? req.query.owner : req.user._id;
  const vehicles = await Vehicle.find({ owner: ownerId }).sort({ createdAt: -1 });

  res.json({
    success: true,
    vehicles
  });
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found.");

  assertVehicleAccess(vehicle, req.user);

  const payload = buildVehiclePayload(req.body);
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !(typeof value === "number" && Number.isNaN(value))) {
      vehicle[key] = value;
    }
  });

  const uploadedImages = await uploadFiles(req.files, "ride-loop/vehicles");
  if (uploadedImages.length) {
    vehicle.images = [...vehicle.images, ...uploadedImages];
  }

  if (req.user.role !== "admin") {
    vehicle.status = "pending";
  }

  await vehicle.save();

  res.json({
    success: true,
    vehicle
  });
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found.");

  assertVehicleAccess(vehicle, req.user);

  vehicle.isActive = false;
  await vehicle.save();

  res.json({
    success: true,
    message: "Vehicle listing archived."
  });
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found.");

  assertVehicleAccess(vehicle, req.user);

  const schedule = await AvailabilitySchedule.findOneAndUpdate(
    { vehicle: vehicle._id },
    {
      owner: vehicle.owner,
      timezone: req.body.timezone || vehicle.availability.timezone,
      weeklySlots: req.body.weeklySlots,
      blockedDates: req.body.blockedDates,
      specialAvailability: req.body.specialAvailability,
      instantBooking: req.body.instantBooking ?? vehicle.availability.instantBooking
    },
    { new: true, upsert: true, runValidators: true }
  );

  vehicle.availability.instantBooking = schedule.instantBooking;
  vehicle.availability.timezone = schedule.timezone;
  await vehicle.save();

  res.json({
    success: true,
    schedule
  });
});

export const getAvailability = asyncHandler(async (req, res) => {
  const schedule = await AvailabilitySchedule.findOne({ vehicle: req.params.id });

  res.json({
    success: true,
    schedule
  });
});

export const getPriceSuggestion = asyncHandler(async (req, res) => {
  const suggestion = suggestRentalPrice(req.body);

  res.json({
    success: true,
    suggestion
  });
});
