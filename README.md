# RideLoop - MERN Bike Rental Marketplace

RideLoop is a production-style MERN marketplace for renting bikes, scooters, e-bikes, and cars. It combines Airbnb-like listings with mobility-specific booking, verification, deposits, payments, reviews, owner tools, and admin moderation.

## Features

- JWT auth with renter, owner, and admin roles
- Google OAuth route support when OAuth env vars are configured
- Forgot password, email verification token flow, and profile updates
- Vehicle listings with multiple images, RC/insurance metadata, deposits, fuel type, helmet availability, mileage limits, pickup location, and approval status
- Nearby search with MongoDB geospatial indexes plus filters for price, rating, vehicle type, fuel type, and distance
- Booking engine with overlap prevention, hourly/daily/weekly pricing, taxes, platform fee, late return fees, invoices, cancellation fees, and extension requests
- Stripe and Razorpay checkout creation with local mock mode when keys are empty
- Reviews, trip photos, owner-to-renter ratings, notifications, and Socket.IO chat rooms
- Owner dashboard, renter dashboard, admin panel, analytics, disputes, and moderation queue
- Tailwind responsive UI, Framer Motion transitions, dark/light mode, PWA manifest, SEO tags, wishlist hooks, and emergency support UI
- AI-ready services for rental price suggestion and fraud risk scoring

## Tech Stack

**Frontend:** React, Redux Toolkit, React Router, Tailwind CSS, Axios, Framer Motion, lucide-react, Vite  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Multer, Passport Google OAuth, Socket.IO  
**Services:** Cloudinary, Stripe, Razorpay, Nodemailer, Google Maps/Mapbox env hooks

## Folder Structure

```text
client/
  public/
  src/
    components/
    data/
    pages/
    services/
    store/
    styles/
server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
```

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Create env files.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB locally and update `server/.env` if your URI differs.

```bash
MONGO_URI=mongodb://127.0.0.1:27017/bike_rental_marketplace
JWT_SECRET=replace-with-a-long-random-secret
```

4. Seed sample users, vehicles, and coupons.

```bash
npm run seed
```

Seed credentials:

```text
admin@rideloop.dev  / Password123!
owner@rideloop.dev  / Password123!
renter@rideloop.dev / Password123!
```

5. Run the full stack.

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000/api/health`

## Environment Variables

Server env highlights:

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bike_rental_marketplace
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
GOOGLE_MAPS_API_KEY=
MAPBOX_TOKEN=
```

Client env highlights:

```text
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=
VITE_MAPBOX_TOKEN=
VITE_STRIPE_PUBLIC_KEY=
VITE_RAZORPAY_KEY_ID=
```

If Cloudinary, Stripe, Razorpay, or SMTP variables are not set, the app uses safe local/mock behavior so development can continue.

## Core API Routes

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/google
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email

GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PATCH  /api/vehicles/:id
PATCH  /api/vehicles/:id/availability
POST   /api/vehicles/price-suggestion

POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id/status
PATCH  /api/bookings/:id/cancel
POST   /api/bookings/:id/extend
PATCH  /api/bookings/:id/return

POST   /api/payments/checkout
PATCH  /api/payments/:id/confirm
PATCH  /api/payments/:id/refund

POST   /api/reviews
GET    /api/reviews/vehicle/:vehicleId

GET    /api/admin/analytics
GET    /api/admin/users
GET    /api/admin/vehicles
PATCH  /api/admin/vehicles/:id/moderate
```

## Production Notes

- Use a managed MongoDB Atlas cluster with geospatial indexes enabled.
- Set strong `JWT_SECRET` and rotate credentials regularly.
- Configure Cloudinary for uploads in production.
- Configure Stripe/Razorpay webhooks before accepting real payments.
- Add a real SMS provider and push subscription persistence for notification delivery.
- Replace the included map preview with Google Maps or Mapbox map rendering using the existing env keys and vehicle coordinates.
- Keep admin accounts seeded or created through a secured internal process only.

## Scripts

```bash
npm run dev      # client + server
npm run server   # Express only
npm run client   # React only
npm run seed     # reset and seed database
npm run build    # build frontend
npm run start    # start backend
```
