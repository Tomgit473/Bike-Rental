import { format } from "date-fns";
import { BadgeCheck, Bike, CalendarClock, Fuel, Gauge, MapPin, ShieldCheck, Star } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import AvailabilityCalendar from "../components/AvailabilityCalendar.jsx";
import LoadingState from "../components/LoadingState.jsx";
import MapPreview from "../components/MapPreview.jsx";
import { fetchVehicle } from "../store/vehicleSlice.js";

export default function VehicleDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: vehicle, status } = useSelector((state) => state.vehicles);
  const vehicles = useSelector((state) => state.vehicles.items);

  useEffect(() => {
    dispatch(fetchVehicle(id));
  }, [dispatch, id]);

  const image = vehicle?.images?.[0]?.url;
  const specs = useMemo(
    () =>
      vehicle
        ? [
            [Bike, vehicle.category],
            [Fuel, vehicle.fuelType],
            [Gauge, `${vehicle.mileageLimitPerDay || 120} km/day`],
            [CalendarClock, vehicle.availability?.instantBooking === false ? "Request" : "Instant"]
          ]
        : [],
    [vehicle]
  );

  if (status === "loading" && !vehicle) {
    return <section className="section py-8"><LoadingState label="Opening listing" /></section>;
  }

  if (!vehicle) return null;

  return (
    <section className="section py-8">
      <div className="mb-6">
        <p className="label">{vehicle.category} rental</p>
        <h1 className="mt-2 max-w-4xl text-3xl font-extrabold md:text-5xl">{vehicle.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1"><Star size={16} className="fill-neon text-neon" /> {vehicle.ratingStats?.average || "New"} ({vehicle.ratingStats?.count || 0})</span>
          <span className="inline-flex items-center gap-1"><MapPin size={16} /> {vehicle.pickupAddress || vehicle.city}</span>
          <span className="inline-flex items-center gap-1"><BadgeCheck size={16} className="text-electric" /> {vehicle.owner?.trustedScore || 80} trust score</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <div className="overflow-hidden rounded-lg border border-black/10 bg-slate-200 shadow-panel dark:border-white/10">
            {image && <img src={image} alt={vehicle.title} className="h-[440px] w-full object-cover" />}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {specs.map(([Icon, label]) => (
              <div key={label} className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/10">
                <Icon className="mb-3 text-electric" size={22} />
                <p className="font-bold capitalize">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
            <div>
              <h2 className="text-2xl font-extrabold">Listing details</h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{vehicle.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(vehicle.features || ["Helmet", "Verified owner", "Roadside help"]).map((feature) => (
                <span key={feature} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-3 text-sm font-semibold dark:bg-white/10">
                  <ShieldCheck size={17} className="text-neon" />
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
              <h2 className="mb-4 text-xl font-extrabold">Availability</h2>
              <AvailabilityCalendar />
            </div>
            <MapPreview vehicles={[vehicle, ...vehicles]} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">Starts at</p>
                <p className="mt-1 text-3xl font-extrabold">INR {vehicle.pricing?.day?.toLocaleString("en-IN")}</p>
                <p className="text-sm text-slate-500">per day</p>
              </div>
              <span className="rounded-lg bg-neon/15 px-3 py-2 text-sm font-bold text-emerald-700 dark:text-neon">
                {format(new Date(), "MMM d")}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-white/10">
                <p className="font-bold">INR {vehicle.pricing?.hour}</p>
                <p className="text-xs text-slate-500">hour</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-white/10">
                <p className="font-bold">INR {vehicle.pricing?.day}</p>
                <p className="text-xs text-slate-500">day</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 dark:bg-white/10">
                <p className="font-bold">INR {vehicle.pricing?.week}</p>
                <p className="text-xs text-slate-500">week</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg bg-slate-100 p-4 text-sm dark:bg-white/10">
              <div className="flex justify-between"><span>Security deposit</span><strong>INR {vehicle.securityDeposit?.toLocaleString("en-IN")}</strong></div>
              <div className="mt-2 flex justify-between"><span>Helmet</span><strong>{vehicle.helmetAvailable ? "Available" : "Not included"}</strong></div>
            </div>
            <Link to={`/checkout/${vehicle._id}`} className="btn-primary mt-5 w-full">
              Continue to checkout
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
