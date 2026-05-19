import { Bike, CalendarClock, ImagePlus, IndianRupee, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardShell from "../components/DashboardShell.jsx";
import StatCard from "../components/StatCard.jsx";
import VehicleCard from "../components/VehicleCard.jsx";
import { api } from "../services/api.js";

const initialForm = {
  title: "",
  description: "",
  category: "bike",
  fuelType: "petrol",
  pickupAddress: "",
  city: "",
  latitude: "12.9716",
  longitude: "77.5946",
  pricePerHour: "120",
  pricePerDay: "900",
  pricePerWeek: "5400",
  securityDeposit: "2000",
  mileageLimit: "140",
  helmetAvailable: true
};

export default function OwnerDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadVehicles = () => {
    api.get("/vehicles/mine").then(({ data }) => setVehicles(data.vehicles)).catch((error) => toast.error(error.message));
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    files.forEach((file) => payload.append("images", file));

    try {
      await api.post("/vehicles", payload, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Listing submitted for approval");
      setForm(initialForm);
      setFiles([]);
      loadVehicles();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
      title="Owner dashboard"
      eyebrow="Fleet management"
      actions={<button type="submit" form="vehicle-form" className="btn-primary"><Plus size={18} /> Add listing</button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Live vehicles" value={vehicles.filter((item) => item.status === "approved").length} />
        <StatCard label="Pending review" value={vehicles.filter((item) => item.status === "pending").length} />
        <StatCard label="Completed trips" value={vehicles.reduce((sum, item) => sum + Number(item.tripsCompleted || 0), 0)} />
        <StatCard label="Avg rating" value={(vehicles.reduce((sum, item) => sum + Number(item.ratingStats?.average || 0), 0) / Math.max(vehicles.length, 1)).toFixed(1)} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form id="vehicle-form" onSubmit={submit} className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
          <div>
            <p className="label">New listing</p>
            <h2 className="mt-2 text-2xl font-extrabold">Vehicle details</h2>
          </div>
          <input className="input" placeholder="Title" value={form.title} onChange={(event) => update("title", event.target.value)} required />
          <textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={(event) => update("description", event.target.value)} required />
          <div className="grid gap-3 md:grid-cols-2">
            <select className="input" value={form.category} onChange={(event) => update("category", event.target.value)}>
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
              <option value="e-bike">E-bike</option>
              <option value="car">Car</option>
            </select>
            <select className="input" value={form.fuelType} onChange={(event) => update("fuelType", event.target.value)}>
              <option value="petrol">Petrol</option>
              <option value="electric">Electric</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="cng">CNG</option>
            </select>
          </div>
          <input className="input" placeholder="Pickup address" value={form.pickupAddress} onChange={(event) => update("pickupAddress", event.target.value)} required />
          <div className="grid gap-3 md:grid-cols-3">
            <input className="input" placeholder="City" value={form.city} onChange={(event) => update("city", event.target.value)} />
            <input className="input" placeholder="Latitude" value={form.latitude} onChange={(event) => update("latitude", event.target.value)} />
            <input className="input" placeholder="Longitude" value={form.longitude} onChange={(event) => update("longitude", event.target.value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input className="input" placeholder="Hour" value={form.pricePerHour} onChange={(event) => update("pricePerHour", event.target.value)} />
            <input className="input" placeholder="Day" value={form.pricePerDay} onChange={(event) => update("pricePerDay", event.target.value)} />
            <input className="input" placeholder="Week" value={form.pricePerWeek} onChange={(event) => update("pricePerWeek", event.target.value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Deposit" value={form.securityDeposit} onChange={(event) => update("securityDeposit", event.target.value)} />
            <input className="input" placeholder="Mileage limit" value={form.mileageLimit} onChange={(event) => update("mileageLimit", event.target.value)} />
          </div>
          <label className="flex items-center gap-3 rounded-lg bg-slate-100 p-3 text-sm font-bold dark:bg-white/10">
            <input type="checkbox" checked={form.helmetAvailable} onChange={(event) => update("helmetAvailable", event.target.checked)} />
            Helmet available
          </label>
          <label className="grid gap-2 rounded-lg border border-dashed border-black/20 p-4 text-sm font-bold dark:border-white/20">
            <span className="inline-flex items-center gap-2"><ImagePlus size={18} /> Upload images</span>
            <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit listing"}
          </button>
        </form>

        <div>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {[
              [Bike, "Vehicle docs"],
              [IndianRupee, "AI pricing"],
              [CalendarClock, "Schedules"]
            ].map(([Icon, label]) => (
              <div key={label} className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/10">
                <Icon className="mb-3 text-electric" size={22} />
                <p className="font-bold">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
            {!vehicles.length && (
              <p className="rounded-lg border border-black/10 bg-white p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                Your submitted listings will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
