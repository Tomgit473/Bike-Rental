import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import LoadingState from "../components/LoadingState.jsx";
import MapPreview from "../components/MapPreview.jsx";
import SearchFilters from "../components/SearchFilters.jsx";
import VehicleCard from "../components/VehicleCard.jsx";
import { fetchVehicles } from "../store/vehicleSlice.js";

export default function Explore() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, status, pagination } = useSelector((state) => state.vehicles);
  const activeFilters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  useEffect(() => {
    dispatch(fetchVehicles(activeFilters));
  }, [activeFilters, dispatch]);

  const search = (filters) => {
    setSearchParams(Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined));
  };

  return (
    <section className="section py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="label">Explore rentals</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">Find a verified ride nearby</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold shadow-panel dark:bg-white/10">
          <SlidersHorizontal size={18} className="text-electric" />
          {pagination?.total || items.length} available
        </div>
      </div>

      <SearchFilters onSearch={search} initialValues={activeFilters} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          {status === "loading" ? (
            <LoadingState label="Finding rides" />
          ) : !items.length ? (
            <p className="rounded-lg border border-black/10 bg-white p-5 text-sm text-slate-600 shadow-panel dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              No rentals matched those filters. Try widening the price or vehicle type.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <MapPreview vehicles={items} />
        </aside>
      </div>
    </section>
  );
}
