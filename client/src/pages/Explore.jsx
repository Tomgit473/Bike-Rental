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
  const { items, status, error, pagination } = useSelector((state) => state.vehicles);
  const filterKey = searchParams.toString();
  const activeFilters = useMemo(() => Object.fromEntries(new URLSearchParams(filterKey).entries()), [filterKey]);

  useEffect(() => {
    dispatch(fetchVehicles(activeFilters));
  }, [filterKey, dispatch]);

  const search = (filters) => {
    setSearchParams(Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined));
  };

  const clearFilters = () => setSearchParams({});
  const page = Number(activeFilters.page || 1);
  const pages = pagination?.pages || 1;

  const gotoPage = (next) => {
    setSearchParams({ ...activeFilters, page: String(next) });
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
          {pagination?.total ?? items.length} available
        </div>
      </div>

      <SearchFilters onSearch={search} initialValues={activeFilters} />
      {Object.keys(activeFilters).length > 0 && (
        <button type="button" onClick={clearFilters} className="mt-3 text-sm font-bold text-electric hover:underline">
          Clear all filters
        </button>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          {status === "loading" ? (
            <LoadingState label="Finding rides" />
          ) : status === "failed" ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              Couldn’t load rides{error ? `: ${error}` : "."} Try again.
            </p>
          ) : !items.length ? (
            <p className="rounded-lg border border-black/10 bg-white p-5 text-sm text-slate-600 shadow-panel dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              No rentals matched those filters. Try widening the price or vehicle type.
            </p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((vehicle) => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))}
              </div>
              {pages > 1 && (
                <div className="mt-6 flex items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-bold shadow-panel dark:border-white/10 dark:bg-white/10">
                  <button type="button" disabled={page <= 1} onClick={() => gotoPage(page - 1)} className="disabled:opacity-40">
                    ← Prev
                  </button>
                  <span>Page {page} of {pages}</span>
                  <button type="button" disabled={page >= pages} onClick={() => gotoPage(page + 1)} className="disabled:opacity-40">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <MapPreview vehicles={items} />
        </aside>
      </div>
    </section>
  );
}
