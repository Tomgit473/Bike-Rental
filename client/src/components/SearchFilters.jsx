import { Filter, LocateFixed, Search } from "lucide-react";
import { useEffect, useState } from "react";

const defaultFilters = {
  search: "",
  category: "",
  fuelType: "",
  maxPrice: "",
  rentalType: "daily",
  latitude: "",
  longitude: "",
  distance: 25
};

export default function SearchFilters({ onSearch, compact = false, initialValues = {} }) {
  const [filters, setFilters] = useState({
    ...defaultFilters,
    ...initialValues
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      ...defaultFilters,
      ...initialValues
    }));
  }, [initialValues]);

  const update = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const useLocation = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      setFilters((current) => ({
        ...current,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }));
    });
  };

  const submit = (event) => {
    event.preventDefault();
    onSearch?.(filters);
  };

  return (
    <form onSubmit={submit} className={`glass rounded-lg p-3 shadow-panel ${compact ? "" : "md:p-4"}`}>
      <div className="grid gap-3 md:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr_auto]">
        <label className="grid gap-1">
          <span className="label">Search</span>
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              className="input pl-10"
              placeholder="City, model, pickup area"
              value={filters.search}
              onChange={(event) => update("search", event.target.value)}
            />
          </span>
        </label>
        <label className="grid gap-1">
          <span className="label">Vehicle</span>
          <select className="input" value={filters.category} onChange={(event) => update("category", event.target.value)}>
            <option value="">All</option>
            <option value="bike">Bike</option>
            <option value="scooter">Scooter</option>
            <option value="e-bike">E-bike</option>
            <option value="car">Car</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="label">Fuel</span>
          <select className="input" value={filters.fuelType} onChange={(event) => update("fuelType", event.target.value)}>
            <option value="">Any</option>
            <option value="petrol">Petrol</option>
            <option value="electric">Electric</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="label">Max INR/day</span>
          <input
            className="input"
            inputMode="numeric"
            placeholder="2500"
            value={filters.maxPrice}
            onChange={(event) => update("maxPrice", event.target.value)}
          />
        </label>
        <div className="flex items-end gap-2">
          <button type="button" className="btn-secondary h-12 px-3" onClick={useLocation} title="Use current location">
            <LocateFixed size={18} />
          </button>
          <button type="submit" className="btn-primary h-12 px-4">
            <Filter size={18} />
            Search
          </button>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
          <label className="grid gap-1">
            <span className="label">Rental</span>
            <select className="input" value={filters.rentalType} onChange={(event) => update("rentalType", event.target.value)}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label">Distance</span>
            <input
              className="input"
              type="range"
              min="2"
              max="75"
              value={filters.distance}
              onChange={(event) => update("distance", event.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="Latitude" value={filters.latitude} onChange={(event) => update("latitude", event.target.value)} />
            <input className="input" placeholder="Longitude" value={filters.longitude} onChange={(event) => update("longitude", event.target.value)} />
          </div>
        </div>
      )}
    </form>
  );
}
