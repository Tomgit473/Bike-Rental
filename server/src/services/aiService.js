const categoryBase = {
  bike: 85,
  scooter: 70,
  "e-bike": 95,
  car: 260
};

export const suggestRentalPrice = ({ category, year, rating = 4.4, cityDemand = 1.1 }) => {
  const age = Math.max(0, new Date().getFullYear() - Number(year || new Date().getFullYear()));
  const base = categoryBase[category] || 90;
  const ageFactor = Math.max(0.72, 1 - age * 0.025);
  const ratingFactor = Math.max(0.85, Number(rating || 4.4) / 4.5);
  const hourly = Math.round(base * ageFactor * ratingFactor * Number(cityDemand || 1));
  const daily = Math.round(hourly * 8.5);
  const weekly = Math.round(daily * 5.4);

  return {
    hour: hourly,
    day: daily,
    week: weekly,
    confidence: 0.78,
    signals: ["category", "vehicle_age", "rating", "local_demand"]
  };
};

export const detectFraudRisk = ({ user, booking, vehicle }) => {
  let score = 12;
  const reasons = [];

  if (!user?.isEmailVerified) {
    score += 18;
    reasons.push("email_unverified");
  }
  if (user?.kycStatus !== "approved") {
    score += 20;
    reasons.push("kyc_incomplete");
  }
  if (booking?.priceBreakdown?.total > 25000) {
    score += 12;
    reasons.push("high_value_booking");
  }
  if (vehicle?.ratingStats?.count < 3) {
    score += 5;
    reasons.push("limited_vehicle_history");
  }

  return {
    score: Math.min(score, 100),
    level: score > 65 ? "high" : score > 35 ? "medium" : "low",
    reasons
  };
};
