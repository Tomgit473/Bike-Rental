import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import AvailabilitySchedule from "./models/AvailabilitySchedule.js";
import Booking from "./models/Booking.js";
import Coupon from "./models/Coupon.js";
import Notification from "./models/Notification.js";
import Payment from "./models/Payment.js";
import Review from "./models/Review.js";
import User from "./models/User.js";
import Vehicle from "./models/Vehicle.js";

dotenv.config();

const vehicleImages = [
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"
];

const seed = async () => {
  await connectDB();

  await Promise.all([
    Booking.deleteMany(),
    Payment.deleteMany(),
    Review.deleteMany(),
    Notification.deleteMany(),
    AvailabilitySchedule.deleteMany(),
    Vehicle.deleteMany(),
    Coupon.deleteMany(),
    User.deleteMany()
  ]);

  const [admin, owner, renter] = await User.create([
    {
      name: "Admin Rider",
      email: "admin@rideloop.dev",
      password: "Password123!",
      role: "admin",
      isEmailVerified: true,
      kycStatus: "approved"
    },
    {
      name: "Aarav Owner",
      email: "owner@rideloop.dev",
      password: "Password123!",
      role: "owner",
      phone: "+91 90000 00001",
      isEmailVerified: true,
      kycStatus: "approved",
      trustedScore: 92
    },
    {
      name: "Nisha Renter",
      email: "renter@rideloop.dev",
      password: "Password123!",
      role: "renter",
      phone: "+91 90000 00002",
      isEmailVerified: true,
      kycStatus: "approved",
      trustedScore: 88
    }
  ]);

  const vehicles = await Vehicle.create([
    {
      owner: owner._id,
      title: "Royal Enfield Himalayan Adventure",
      description: "Touring-ready Himalayan with phone mount, dual helmets, and luggage rack.",
      category: "bike",
      brand: "Royal Enfield",
      model: "Himalayan",
      year: 2023,
      registrationNumber: "KA05RL2023",
      images: [{ url: vehicleImages[0], alt: "Royal Enfield Himalayan" }],
      pricing: { hour: 140, day: 1100, week: 6200 },
      securityDeposit: 2500,
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      pickupAddress: "Indiranagar Metro Station, Bengaluru",
      city: "Bengaluru",
      state: "Karnataka",
      fuelType: "petrol",
      helmetAvailable: true,
      mileageLimitPerDay: 180,
      features: ["ABS", "luggage rack", "phone mount"],
      rules: ["Valid driving license required", "No off-road racing"],
      status: "approved",
      ratingStats: { average: 4.8, count: 24 },
      tripsCompleted: 86
    },
    {
      owner: owner._id,
      title: "Ather 450X City Glide",
      description: "Fast electric scooter for easy city commutes with included charger.",
      category: "scooter",
      brand: "Ather",
      model: "450X",
      year: 2024,
      registrationNumber: "KA03EV450",
      images: [{ url: vehicleImages[1], alt: "Ather 450X" }],
      pricing: { hour: 95, day: 720, week: 3900 },
      securityDeposit: 1800,
      location: { type: "Point", coordinates: [77.6413, 12.9784] },
      pickupAddress: "12th Main Road, Indiranagar, Bengaluru",
      city: "Bengaluru",
      state: "Karnataka",
      fuelType: "electric",
      helmetAvailable: true,
      mileageLimitPerDay: 120,
      features: ["fast charging", "reverse assist", "connected dashboard"],
      rules: ["Return with at least 20% charge"],
      status: "approved",
      ratingStats: { average: 4.7, count: 18 },
      tripsCompleted: 52
    },
    {
      owner: owner._id,
      title: "Maruti Swift Weekend Car",
      description: "Clean automatic hatchback, ideal for airport runs and short weekend drives.",
      category: "car",
      brand: "Maruti Suzuki",
      model: "Swift AMT",
      year: 2022,
      registrationNumber: "KA01RL7733",
      images: [{ url: vehicleImages[2], alt: "Maruti Swift" }],
      pricing: { hour: 260, day: 2200, week: 12800 },
      securityDeposit: 6500,
      location: { type: "Point", coordinates: [77.5806, 12.9352] },
      pickupAddress: "Jayanagar 4th Block, Bengaluru",
      city: "Bengaluru",
      state: "Karnataka",
      fuelType: "petrol",
      transmission: "automatic",
      helmetAvailable: false,
      mileageLimitPerDay: 220,
      seats: 5,
      features: ["automatic", "air conditioning", "Bluetooth"],
      rules: ["No smoking", "Interstate trips require owner approval"],
      status: "approved",
      ratingStats: { average: 4.6, count: 31 },
      tripsCompleted: 104
    }
  ]);

  await AvailabilitySchedule.create(
    vehicles.map((vehicle) => ({
      vehicle: vehicle._id,
      owner: owner._id,
      instantBooking: true,
      timezone: "Asia/Kolkata"
    }))
  );

  await Coupon.create({
    code: "RIDE10",
    description: "10% off first booking",
    discountType: "percentage",
    value: 10,
    maxDiscount: 500,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  });

  console.log("Seed complete");
  console.table([
    { role: "admin", email: admin.email, password: "Password123!" },
    { role: "owner", email: owner.email, password: "Password123!" },
    { role: "renter", email: renter.email, password: "Password123!" }
  ]);

  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
