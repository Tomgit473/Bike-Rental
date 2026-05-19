import { Bike, CalendarClock, Fuel, Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function VehicleCard({ vehicle }) {
  const image = vehicle.images?.[0]?.url;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-panel transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-white/10"
    >
      <Link to={`/vehicles/${vehicle._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
          {image && (
            <img
              src={image}
              alt={vehicle.images?.[0]?.alt || vehicle.title}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          )}
          <button
            type="button"
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-lg bg-white/90 text-ink shadow"
            aria-label="Save vehicle"
          >
            <Heart size={18} />
          </button>
          <span className="absolute left-3 top-3 rounded-lg bg-ink/85 px-3 py-1 text-xs font-bold uppercase text-neon">
            {vehicle.category}
          </span>
        </div>
      </Link>
      <div className="grid gap-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link to={`/vehicles/${vehicle._id}`} className="font-bold leading-snug hover:text-electric">
              {vehicle.title}
            </Link>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold">
              <Star size={16} className="fill-neon text-neon" />
              {vehicle.ratingStats?.average || "New"}
            </span>
          </div>
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
            <MapPin size={15} />
            {vehicle.pickupAddress || vehicle.city}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-2 dark:bg-white/10">
            <Fuel size={14} />
            {vehicle.fuelType}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-2 dark:bg-white/10">
            <Bike size={14} />
            {vehicle.mileageLimitPerDay} km
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-2 dark:bg-white/10">
            <CalendarClock size={14} />
            Instant
          </span>
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-black/10 pt-4 dark:border-white/10">
          <div>
            <span className="label">from</span>
            <p className="text-xl font-extrabold">INR {vehicle.pricing?.day?.toLocaleString("en-IN")}</p>
            <p className="text-xs text-slate-500">per day</p>
          </div>
          <Link to={`/checkout/${vehicle._id}`} className="btn-primary px-3 py-2">
            Book
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
