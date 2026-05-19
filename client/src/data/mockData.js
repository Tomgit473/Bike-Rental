export const featuredVehicles = [
  {
    _id: "demo-himalayan",
    title: "Royal Enfield Himalayan Adventure",
    category: "bike",
    fuelType: "petrol",
    city: "Bengaluru",
    pickupAddress: "Indiranagar Metro Station",
    images: [
      {
        url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
        alt: "Adventure motorcycle"
      }
    ],
    pricing: { hour: 140, day: 1100, week: 6200 },
    securityDeposit: 2500,
    ratingStats: { average: 4.8, count: 24 },
    tripsCompleted: 86,
    helmetAvailable: true,
    mileageLimitPerDay: 180,
    owner: { name: "Aarav Owner", trustedScore: 92 },
    location: { coordinates: [77.5946, 12.9716] },
    features: ["ABS", "phone mount", "luggage rack"]
  },
  {
    _id: "demo-ather",
    title: "Ather 450X City Glide",
    category: "scooter",
    fuelType: "electric",
    city: "Bengaluru",
    pickupAddress: "12th Main Road, Indiranagar",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1200&q=80",
        alt: "Electric scooter"
      }
    ],
    pricing: { hour: 95, day: 720, week: 3900 },
    securityDeposit: 1800,
    ratingStats: { average: 4.7, count: 18 },
    tripsCompleted: 52,
    helmetAvailable: true,
    mileageLimitPerDay: 120,
    owner: { name: "Aarav Owner", trustedScore: 92 },
    location: { coordinates: [77.6413, 12.9784] },
    features: ["fast charging", "reverse assist", "connected dashboard"]
  },
  {
    _id: "demo-swift",
    title: "Maruti Swift Weekend Car",
    category: "car",
    fuelType: "petrol",
    city: "Bengaluru",
    pickupAddress: "Jayanagar 4th Block",
    images: [
      {
        url: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=80",
        alt: "Compact rental car"
      }
    ],
    pricing: { hour: 260, day: 2200, week: 12800 },
    securityDeposit: 6500,
    ratingStats: { average: 4.6, count: 31 },
    tripsCompleted: 104,
    helmetAvailable: false,
    mileageLimitPerDay: 220,
    owner: { name: "Aarav Owner", trustedScore: 92 },
    location: { coordinates: [77.5806, 12.9352] },
    features: ["automatic", "air conditioning", "Bluetooth"]
  }
];

export const analyticsCards = [
  { label: "Total earnings", value: "₹8.4L", delta: "+18%" },
  { label: "Bookings", value: "1,284", delta: "+24%" },
  { label: "Vehicles live", value: "342", delta: "+11%" },
  { label: "Avg rating", value: "4.72", delta: "+0.2" }
];
