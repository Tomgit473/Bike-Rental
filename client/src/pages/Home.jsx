import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarClock, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import MapPreview from "../components/MapPreview.jsx";
import SearchFilters from "../components/SearchFilters.jsx";
import VehicleCard from "../components/VehicleCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { fetchVehicles } from "../store/vehicleSlice.js";

const trustItems = [
  { icon: ShieldCheck, label: "Verified RC and insurance" },
  { icon: CalendarClock, label: "Live availability" },
  { icon: BadgeCheck, label: "Deposit and refund tracking" }
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const vehicles = useSelector((state) => state.vehicles.items);

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 6 }));
  }, [dispatch]);

  const search = (filters) => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)
    );
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1800&q=80"
          alt="Motorcycle rental on an open road"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-ink/90" />
        <div className="section relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-center py-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur">
              <Sparkles size={16} className="text-neon" />
              Rent nearby bikes, scooters, e-bikes, and cars
            </p>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-tight md:text-7xl">
              RideLoop
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/86">
              A verified mobility marketplace for hourly errands, daily city plans, weekly road trips, and owner-run rental fleets.
            </p>
          </motion.div>

          <div className="mt-8 max-w-6xl">
            <SearchFilters onSearch={search} />
          </div>

          <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.label} className="inline-flex items-center gap-3 rounded-lg bg-white/12 px-4 py-3 text-sm font-semibold backdrop-blur">
                <item.icon size={18} className="text-neon" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section -mt-10 relative z-20 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-panel dark:border-white/10 dark:bg-white/10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="label">Near you</p>
              <h2 className="mt-2 text-2xl font-extrabold">Popular rentals</h2>
            </div>
            <Link to="/explore" className="btn-secondary py-2">
              View all
              <ArrowRight size={16} />
            </Link>
          </div>
          {vehicles.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.slice(0, 2).map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <LoadingState label="Loading popular rentals" />
          )}
        </div>
        <MapPreview vehicles={vehicles} />
      </section>

      <section className="section mt-16 grid gap-5 md:grid-cols-4">
        {[
          ["4.7/5", "Average rider rating"],
          ["24/7", "Emergency support"],
          ["18%", "Tax and invoice logic"],
          ["3 min", "Mock checkout setup"]
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
            <p className="text-3xl font-extrabold">{value}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{label}</p>
          </div>
        ))}
      </section>

      <section className="section mt-16">
        {vehicles.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {vehicles.slice(0, 3).map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
