import { featuredVehicles } from "../data/mockData.js";

const STORAGE_KEY = "rideLoopDemoDB";
const TOKEN_PREFIX = "demo-token:";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createId = (prefix) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const readStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
};

const writeStorage = (value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const seedVehicle = (vehicle, ownerId, overrides = {}) => ({
  ...vehicle,
  description:
    overrides.description ||
    `${vehicle.title} is ready for city commutes, weekend rides, and flexible pickup from ${vehicle.pickupAddress}.`,
  brand: overrides.brand || vehicle.title.split(" ")[0],
  model: overrides.model || vehicle.title.split(" ").slice(1, 3).join(" "),
  year: overrides.year || 2024,
  registrationNumber: overrides.registrationNumber || `KA${Math.floor(Math.random() * 90 + 10)}${Math.floor(Math.random() * 9000 + 1000)}`,
  owner: ownerId,
  state: overrides.state || "Karnataka",
  isActive: true,
  status: overrides.status || "approved",
  availability: {
    instantBooking: overrides.instantBooking ?? true,
    minHours: 2,
    maxDays: 21,
    advanceNoticeHours: 1,
    timezone: "Asia/Kolkata"
  },
  rules: ["Valid driving license required", "Return with the same fuel level"],
  seats: vehicle.category === "car" ? 5 : 2,
  transmission: vehicle.category === "car" ? "manual" : "automatic",
  documents: {
    insuranceVerified: true,
    registrationVerified: true
  },
  createdAt: overrides.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const createSeedState = () => {
  const adminId = "demo-user-admin";
  const ownerId = "demo-user-owner";
  const renterId = "demo-user-renter";
  const now = Date.now();

  const users = [
    {
      _id: adminId,
      name: "RideLoop Admin",
      email: "admin@rideloop.dev",
      password: "Password123!",
      phone: "+91 90000 00001",
      role: "admin",
      walletBalance: 0,
      trustedScore: 99,
      kycStatus: "verified",
      favoriteVehicles: [],
      isEmailVerified: true,
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: ownerId,
      name: "Aarav Owner",
      email: "owner@rideloop.dev",
      password: "Password123!",
      phone: "+91 90000 00002",
      role: "owner",
      walletBalance: 18500,
      trustedScore: 92,
      kycStatus: "verified",
      favoriteVehicles: [],
      isEmailVerified: true,
      createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: renterId,
      name: "Riya Renter",
      email: "renter@rideloop.dev",
      password: "Password123!",
      phone: "+91 90000 00003",
      role: "renter",
      walletBalance: 2400,
      trustedScore: 81,
      kycStatus: "pending",
      favoriteVehicles: ["demo-himalayan", "demo-ather"],
      isEmailVerified: true,
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const vehicles = [
    seedVehicle(featuredVehicles[0], ownerId, {
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString()
    }),
    seedVehicle(featuredVehicles[1], ownerId, {
      createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString()
    }),
    seedVehicle(featuredVehicles[2], ownerId, {
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString()
    }),
    seedVehicle(
      {
        _id: "demo-revolt",
        title: "Revolt RV400 Night Ride",
        category: "e-bike",
        fuelType: "electric",
        city: "Bengaluru",
        pickupAddress: "Koramangala 5th Block",
        images: [
          {
            url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
            alt: "Electric motorcycle"
          }
        ],
        pricing: { hour: 110, day: 820, week: 4700 },
        securityDeposit: 2200,
        ratingStats: { average: 4.5, count: 9 },
        tripsCompleted: 14,
        helmetAvailable: true,
        mileageLimitPerDay: 130,
        owner: { name: "Aarav Owner", trustedScore: 92 },
        location: { coordinates: [77.6101, 12.9355] },
        features: ["swappable battery", "USB charging", "anti-theft alerts"]
      },
      ownerId,
      {
        status: "pending",
        description: "Freshly listed electric bike waiting for moderation before going live.",
        createdAt: new Date(now - 12 * 60 * 60 * 1000).toISOString()
      }
    )
  ];

  const bookingId = "demo-booking-1";
  const paymentId = "demo-payment-1";
  const bookingTotal = 3794;

  return {
    users,
    vehicles,
    bookings: [
      {
        _id: bookingId,
        invoiceNumber: "RL-1001",
        vehicle: "demo-himalayan",
        renter: renterId,
        owner: ownerId,
        rentalType: "daily",
        startDate: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
        pickupLocation: {
          address: "Indiranagar Metro Station",
          coordinates: [77.5946, 12.9716]
        },
        returnLocation: {
          address: "Indiranagar Metro Station",
          coordinates: [77.5946, 12.9716]
        },
        status: "confirmed",
        paymentStatus: "paid",
        couponCode: "RIDE10",
        renterNotes: "Need one extra helmet if possible",
        priceBreakdown: {
          currency: "INR",
          base: 2200,
          platformFee: 110,
          taxes: 434,
          securityDeposit: 1050,
          discount: 0,
          total: bookingTotal
        },
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    payments: [
      {
        _id: paymentId,
        booking: bookingId,
        user: renterId,
        provider: "stripe",
        providerOrderId: "pi_demo_seed",
        amount: bookingTotal,
        currency: "INR",
        status: "captured",
        metadata: { mock: true },
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
};

const ensureDb = () => {
  const stored = readStorage();
  if (stored) {
    return JSON.parse(stored);
  }

  const seeded = createSeedState();
  writeStorage(seeded);
  return seeded;
};

const saveDb = (db) => {
  writeStorage(db);
  return db;
};

const toAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  walletBalance: user.walletBalance || 0,
  trustedScore: user.trustedScore || 70,
  kycStatus: user.kycStatus || "pending",
  favoriteVehicles: user.favoriteVehicles || [],
  isEmailVerified: Boolean(user.isEmailVerified),
  createdAt: user.createdAt
});

const summarizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  phone: user.phone,
  trustedScore: user.trustedScore || 70,
  role: user.role,
  avatar: user.avatar
});

const summarizeVehicle = (vehicle, db) => ({
  ...clone(vehicle),
  owner: summarizeUser(db.users.find((user) => user._id === vehicle.owner))
});

const summarizeBooking = (booking, db) => ({
  ...clone(booking),
  vehicle: summarizeVehicle(db.vehicles.find((vehicle) => vehicle._id === booking.vehicle), db),
  renter: summarizeUser(db.users.find((user) => user._id === booking.renter)),
  owner: summarizeUser(db.users.find((user) => user._id === booking.owner))
});

const findUserByToken = (db, headers = {}) => {
  const headerValue =
    headers.Authorization ||
    headers.authorization ||
    (typeof window !== "undefined" ? `Bearer ${window.localStorage.getItem("rideLoopToken") || ""}` : "");

  const token = headerValue.startsWith("Bearer ") ? headerValue.slice(7) : headerValue;
  if (!token.startsWith(TOKEN_PREFIX)) return null;

  return db.users.find((user) => user._id === token.slice(TOKEN_PREFIX.length)) || null;
};

const requireUser = (db, headers) => {
  const user = findUserByToken(db, headers);
  if (!user) throw createError(401, "Please login to continue.");
  return user;
};

const requireRole = (user, roles) => {
  if (!roles.includes(user.role)) {
    throw createError(403, "You do not have permission to do that.");
  }
};

const getDurationHours = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const hours = Math.ceil((end - start) / 36e5);
  return Math.max(1, hours);
};

const buildPriceBreakdown = ({ vehicle, startDate, endDate, rentalType, couponCode }) => {
  const hours = getDurationHours(startDate, endDate);
  const unitKey = rentalType === "weekly" ? "week" : rentalType === "hourly" ? "hour" : "day";
  const units =
    rentalType === "weekly"
      ? Math.ceil(hours / 168)
      : rentalType === "hourly"
        ? hours
        : Math.ceil(hours / 24);
  const base = Number(vehicle.pricing?.[unitKey] || 0) * units;
  const discount = couponCode?.trim().toUpperCase() === "RIDE10" ? Math.round(base * 0.1) : 0;
  const discountedBase = Math.max(0, base - discount);
  const platformFee = Math.round(discountedBase * 0.05);
  const taxes = Math.round((discountedBase + platformFee) * 0.18);
  const securityDeposit = Number(vehicle.securityDeposit || 0);

  return {
    currency: "INR",
    base: discountedBase,
    platformFee,
    taxes,
    securityDeposit,
    discount,
    total: discountedBase + platformFee + taxes + securityDeposit
  };
};

const matchesSearch = (vehicle, search) => {
  if (!search) return true;
  const haystack = [vehicle.title, vehicle.description, vehicle.city, vehicle.pickupAddress]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(search.toLowerCase());
};

const getPriceKey = (rentalType) =>
  rentalType === "hourly" ? "hour" : rentalType === "weekly" ? "week" : "day";

const listVehicles = (db, params = {}, currentUser = null) => {
  const rentalType = params.rentalType || "daily";
  const priceKey = getPriceKey(rentalType);
  const limit = Number(params.limit || 12);
  const page = Number(params.page || 1);

  let vehicles = db.vehicles.filter((vehicle) => {
    const canView = vehicle.isActive && vehicle.status === "approved";
    const isOwner = currentUser && (currentUser.role === "admin" || vehicle.owner === currentUser._id);
    if (!canView && !isOwner) return false;
    if (params.category && !String(params.category).split(",").includes(vehicle.category)) return false;
    if (params.fuelType && !String(params.fuelType).split(",").includes(vehicle.fuelType)) return false;
    if (params.maxPrice && Number(vehicle.pricing?.[priceKey] || 0) > Number(params.maxPrice)) return false;
    if (params.minPrice && Number(vehicle.pricing?.[priceKey] || 0) < Number(params.minPrice)) return false;
    return matchesSearch(vehicle, params.search);
  });

  const sort = params.sort || "recommended";
  vehicles.sort((a, b) => {
    if (sort === "price_low") return Number(a.pricing?.[priceKey] || 0) - Number(b.pricing?.[priceKey] || 0);
    if (sort === "price_high") return Number(b.pricing?.[priceKey] || 0) - Number(a.pricing?.[priceKey] || 0);
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "rating") return Number(b.ratingStats?.average || 0) - Number(a.ratingStats?.average || 0);
    return (
      Number(b.ratingStats?.average || 0) - Number(a.ratingStats?.average || 0) ||
      Number(b.tripsCompleted || 0) - Number(a.tripsCompleted || 0)
    );
  });

  const total = vehicles.length;
  const offset = (page - 1) * limit;
  const paged = vehicles.slice(offset, offset + limit).map((vehicle) => summarizeVehicle(vehicle, db));

  return {
    success: true,
    vehicles: paged,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit))
    }
  };
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(createError(400, `Unable to read image ${file.name}.`));
    reader.readAsDataURL(file);
  });

const parseVehicleForm = async (payload) => {
  if (!(payload instanceof FormData)) return payload || {};

  const data = {};
  payload.forEach((value, key) => {
    if (key === "images") return;
    data[key] = value;
  });

  const images = await Promise.all(
    payload
      .getAll("images")
      .filter((value) => value instanceof File)
      .map(async (file) => ({
        url: await fileToDataUrl(file),
        alt: file.name
      }))
  );

  data.images = images;
  return data;
};

const createVehicleRecord = async (db, payload, user) => {
  requireRole(user, ["owner", "admin"]);

  const data = await parseVehicleForm(payload);
  const vehicle = {
    _id: createId("vehicle"),
    title: data.title,
    description: data.description,
    category: data.category || "bike",
    fuelType: data.fuelType || "petrol",
    pickupAddress: data.pickupAddress,
    city: data.city || "Bengaluru",
    state: "Karnataka",
    images:
      data.images?.length
        ? data.images
        : [
            {
              url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
              alt: data.title || "Vehicle"
            }
          ],
    pricing: {
      hour: Number(data.pricePerHour || data.hour || 0),
      day: Number(data.pricePerDay || data.day || 0),
      week: Number(data.pricePerWeek || data.week || 0)
    },
    securityDeposit: Number(data.securityDeposit || 0),
    ratingStats: { average: 0, count: 0 },
    tripsCompleted: 0,
    helmetAvailable: String(data.helmetAvailable) !== "false",
    mileageLimitPerDay: Number(data.mileageLimit || data.mileageLimitPerDay || 120),
    owner: user._id,
    location: {
      coordinates: [Number(data.longitude || 77.5946), Number(data.latitude || 12.9716)]
    },
    features: ["Verified owner", "Fuel policy included", "Roadside support"],
    availability: {
      instantBooking: true,
      minHours: 2,
      maxDays: 21,
      advanceNoticeHours: 1,
      timezone: "Asia/Kolkata"
    },
    isActive: true,
    status: user.role === "admin" ? "approved" : "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.vehicles.unshift(vehicle);
  saveDb(db);

  return {
    success: true,
    vehicle: summarizeVehicle(vehicle, db)
  };
};

const createBookingRecord = (db, payload, user) => {
  const vehicle = db.vehicles.find((item) => item._id === payload.vehicleId);
  if (!vehicle || !vehicle.isActive || vehicle.status !== "approved") {
    throw createError(404, "Vehicle is not available for booking.");
  }

  if (vehicle.owner === user._id) {
    throw createError(400, "Owners cannot book their own vehicle.");
  }

  if (new Date(payload.endDate) <= new Date(payload.startDate)) {
    throw createError(400, "Return time must be after pickup time.");
  }

  const overlaps = db.bookings.some(
    (booking) =>
      booking.vehicle === vehicle._id &&
      !["cancelled", "rejected"].includes(booking.status) &&
      new Date(booking.startDate) < new Date(payload.endDate) &&
      new Date(booking.endDate) > new Date(payload.startDate)
  );

  if (overlaps) {
    throw createError(409, "This vehicle is already booked for those dates.");
  }

  const booking = {
    _id: createId("booking"),
    invoiceNumber: `RL-${1000 + db.bookings.length + 1}`,
    vehicle: vehicle._id,
    renter: user._id,
    owner: vehicle.owner,
    rentalType: payload.rentalType || "daily",
    startDate: payload.startDate,
    endDate: payload.endDate,
    pickupLocation: payload.pickupLocation,
    returnLocation: payload.returnLocation,
    couponCode: payload.couponCode,
    renterNotes: payload.renterNotes,
    status: vehicle.availability?.instantBooking === false ? "pending" : "confirmed",
    paymentStatus: "unpaid",
    priceBreakdown: buildPriceBreakdown({
      vehicle,
      startDate: payload.startDate,
      endDate: payload.endDate,
      rentalType: payload.rentalType || "daily",
      couponCode: payload.couponCode
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.bookings.unshift(booking);
  saveDb(db);

  return {
    success: true,
    booking: summarizeBooking(booking, db),
    fraudRisk: { score: 0.08, level: "low" }
  };
};

const createPaymentRecord = (db, payload, user) => {
  const booking = db.bookings.find((item) => item._id === payload.bookingId);
  if (!booking) throw createError(404, "Booking not found.");
  if (booking.renter !== user._id && user.role !== "admin") {
    throw createError(403, "Only the renter can pay for this booking.");
  }

  booking.paymentStatus = "paid";
  if (booking.status === "pending") {
    booking.status = "confirmed";
  }
  booking.updatedAt = new Date().toISOString();

  const payment = {
    _id: createId("payment"),
    booking: booking._id,
    user: user._id,
    provider: payload.provider || "stripe",
    providerOrderId: createId("checkout"),
    amount: booking.priceBreakdown.total,
    currency: booking.priceBreakdown.currency || "INR",
    status: "captured",
    metadata: {
      mock: true,
      provider: payload.provider || "stripe"
    },
    createdAt: new Date().toISOString()
  };

  db.payments.unshift(payment);
  saveDb(db);

  return {
    success: true,
    payment,
    providerPayload: {
      id: payment.providerOrderId,
      provider: payment.provider,
      mock: true
    }
  };
};

const getDashboard = (db, user) => {
  const renterBookings = db.bookings
    .filter((booking) => booking.renter === user._id)
    .slice(0, 5)
    .map((booking) => summarizeBooking(booking, db));
  const ownerVehicles = db.vehicles
    .filter((vehicle) => vehicle.owner === user._id)
    .slice(0, 5)
    .map((vehicle) => summarizeVehicle(vehicle, db));
  const ownerBookings = db.bookings
    .filter((booking) => booking.owner === user._id)
    .slice(0, 5)
    .map((booking) => summarizeBooking(booking, db));
  const payments = db.payments.filter((payment) => payment.user === user._id).slice(0, 5);

  return {
    success: true,
    dashboard: {
      renterBookings,
      ownerVehicles,
      ownerBookings,
      payments,
      stats: {
        renterTrips: renterBookings.length,
        listedVehicles: ownerVehicles.length,
        ownerRequests: ownerBookings.length,
        ownerEarnings: ownerBookings
          .filter((booking) => booking.paymentStatus === "paid")
          .reduce((sum, booking) => sum + Number(booking.priceBreakdown?.base || 0), 0)
      }
    }
  };
};

const getAnalytics = (db) => {
  const revenue = db.payments
    .filter((payment) => payment.status === "captured")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const approvedVehicles = db.vehicles.filter((vehicle) => vehicle.status === "approved");
  const topVehicles = [...approvedVehicles]
    .sort((a, b) => Number(b.tripsCompleted || 0) - Number(a.tripsCompleted || 0))
    .slice(0, 3)
    .map((vehicle) => summarizeVehicle(vehicle, db));

  return {
    success: true,
    analytics: {
      totals: {
        users: db.users.length,
        vehicles: db.vehicles.length,
        bookings: db.bookings.length,
        revenue,
        payments: db.payments.filter((payment) => payment.status === "captured").length
      },
      topVehicles
    }
  };
};

const moderateVehicle = (db, id, payload) => {
  const vehicle = db.vehicles.find((item) => item._id === id);
  if (!vehicle) throw createError(404, "Vehicle not found.");

  vehicle.status = payload.status;
  vehicle.updatedAt = new Date().toISOString();
  saveDb(db);

  return {
    success: true,
    vehicle: summarizeVehicle(vehicle, db)
  };
};

const handleAuthRoutes = (db, method, path, payload, headers) => {
  if (method === "POST" && path === "/auth/login") {
    const user = db.users.find((item) => item.email.toLowerCase() === String(payload.email || "").toLowerCase());
    if (!user || user.password !== payload.password) {
      throw createError(401, "Invalid email or password.");
    }

    return {
      success: true,
      token: `${TOKEN_PREFIX}${user._id}`,
      user: toAuthUser(user)
    };
  }

  if (method === "POST" && path === "/auth/register") {
    const email = String(payload.email || "").toLowerCase();
    if (db.users.some((item) => item.email.toLowerCase() === email)) {
      throw createError(409, "An account with that email already exists.");
    }

    const user = {
      _id: createId("user"),
      name: payload.name,
      email,
      password: payload.password,
      phone: payload.phone || "",
      role: payload.role === "owner" ? "owner" : "renter",
      walletBalance: 0,
      trustedScore: 70,
      kycStatus: "pending",
      favoriteVehicles: [],
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    };

    db.users.unshift(user);
    saveDb(db);

    return {
      success: true,
      token: `${TOKEN_PREFIX}${user._id}`,
      user: toAuthUser(user)
    };
  }

  if (method === "GET" && path === "/auth/me") {
    const user = requireUser(db, headers);
    return {
      success: true,
      user: toAuthUser(user)
    };
  }

  if (method === "POST" && path === "/auth/forgot-password") {
    return {
      success: true,
      message: "If the email exists, reset instructions have been sent."
    };
  }

  return null;
};

export const handleDemoRequest = async ({ method, url, data, params, headers }) => {
  const db = ensureDb();
  const path = url.startsWith("/") ? url : `/${url}`;
  const upperMethod = method.toUpperCase();
  const authResult = handleAuthRoutes(db, upperMethod, path, data, headers);

  if (authResult) {
    return authResult;
  }

  const currentUser = findUserByToken(db, headers);

  if (upperMethod === "GET" && path === "/vehicles") {
    return listVehicles(db, params, currentUser);
  }

  if (upperMethod === "GET" && path === "/vehicles/mine") {
    const user = requireUser(db, headers);
    requireRole(user, ["owner", "admin"]);

    return {
      success: true,
      vehicles: db.vehicles
        .filter((vehicle) => user.role === "admin" || vehicle.owner === user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((vehicle) => summarizeVehicle(vehicle, db))
    };
  }

  if (upperMethod === "POST" && path === "/vehicles") {
    const user = requireUser(db, headers);
    return createVehicleRecord(db, data, user);
  }

  if (upperMethod === "GET" && /^\/vehicles\/[^/]+$/.test(path)) {
    const vehicle = db.vehicles.find((item) => item._id === path.split("/")[2]);
    if (!vehicle) throw createError(404, "Vehicle not found.");

    const canView = vehicle.isActive && vehicle.status === "approved";
    const isOwner = currentUser && (currentUser.role === "admin" || currentUser._id === vehicle.owner);
    if (!canView && !isOwner) throw createError(404, "Vehicle not found.");

    return {
      success: true,
      vehicle: summarizeVehicle(vehicle, db),
      schedule: {
        vehicle: vehicle._id,
        timezone: vehicle.availability?.timezone || "Asia/Kolkata",
        instantBooking: vehicle.availability?.instantBooking !== false
      }
    };
  }

  if (upperMethod === "GET" && path === "/bookings") {
    const user = requireUser(db, headers);
    let bookings;

    if (user.role === "admin") {
      bookings = db.bookings;
    } else if (params?.scope === "owner" || user.role === "owner") {
      bookings = db.bookings.filter((booking) => booking.owner === user._id);
    } else {
      bookings = db.bookings.filter((booking) => booking.renter === user._id);
    }

    return {
      success: true,
      bookings: bookings.map((booking) => summarizeBooking(booking, db))
    };
  }

  if (upperMethod === "POST" && path === "/bookings") {
    const user = requireUser(db, headers);
    return createBookingRecord(db, data, user);
  }

  if (upperMethod === "POST" && path === "/payments/checkout") {
    const user = requireUser(db, headers);
    return createPaymentRecord(db, data, user);
  }

  if (upperMethod === "GET" && path === "/users/dashboard") {
    const user = requireUser(db, headers);
    return getDashboard(db, user);
  }

  if (upperMethod === "GET" && path === "/admin/analytics") {
    const user = requireUser(db, headers);
    requireRole(user, ["admin"]);
    return getAnalytics(db);
  }

  if (upperMethod === "GET" && path === "/admin/vehicles") {
    const user = requireUser(db, headers);
    requireRole(user, ["admin"]);
    return {
      success: true,
      vehicles: db.vehicles
        .filter((vehicle) => vehicle.status === "pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((vehicle) => summarizeVehicle(vehicle, db))
    };
  }

  if (upperMethod === "GET" && path === "/admin/users") {
    const user = requireUser(db, headers);
    requireRole(user, ["admin"]);
    return {
      success: true,
      users: db.users.map((item) => toAuthUser(item))
    };
  }

  if (upperMethod === "PATCH" && /^\/admin\/vehicles\/[^/]+\/moderate$/.test(path)) {
    const user = requireUser(db, headers);
    requireRole(user, ["admin"]);
    const id = path.split("/")[3];
    return moderateVehicle(db, id, data);
  }

  throw createError(404, "That demo endpoint is not implemented yet.");
};
