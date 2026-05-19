import { CheckCircle2, CircleDollarSign, ShieldAlert, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardShell from "../components/DashboardShell.jsx";
import StatCard from "../components/StatCard.jsx";
import { analyticsCards } from "../data/mockData.js";
import { api } from "../services/api.js";

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);

  const load = () => {
    Promise.all([api.get("/admin/analytics"), api.get("/admin/vehicles"), api.get("/admin/users")])
      .then(([analyticsRes, vehiclesRes, usersRes]) => {
        setAnalytics(analyticsRes.data.analytics);
        setVehicles(vehiclesRes.data.vehicles);
        setUsers(usersRes.data.users);
      })
      .catch((error) => toast.error(error.message));
  };

  useEffect(() => {
    load();
  }, []);

  const moderate = async (id, status) => {
    try {
      await api.patch(`/admin/vehicles/${id}/moderate`, { status });
      toast.success(`Vehicle ${status}`);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cards = analytics
    ? [
        { label: "Users", value: analytics.totals.users, delta: "+live" },
        { label: "Vehicles", value: analytics.totals.vehicles, delta: "+queue" },
        { label: "Bookings", value: analytics.totals.bookings, delta: "+trend" },
        { label: "Revenue", value: `INR ${analytics.totals.revenue.toLocaleString("en-IN")}`, delta: "+paid" }
      ]
    : analyticsCards;

  return (
    <DashboardShell title="Admin panel" eyebrow="Marketplace operations">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Vehicle approvals</h2>
            <ShieldAlert className="text-electric" />
          </div>
          <div className="grid gap-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="grid gap-3 rounded-lg bg-slate-100 p-4 dark:bg-white/10 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-bold">{vehicle.title}</p>
                  <p className="text-sm text-slate-500">{vehicle.owner?.name} - {vehicle.category} - {vehicle.city}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary py-2" onClick={() => moderate(vehicle._id, "rejected")}>
                    Reject
                  </button>
                  <button type="button" className="btn-primary py-2" onClick={() => moderate(vehicle._id, "approved")}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {!vehicles.length && (
              <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
                No vehicles waiting for review.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {[
            [Users, "Users", users.length],
            [CircleDollarSign, "Captured payments", analytics?.totals?.payments || 0],
            [CheckCircle2, "Top vehicle", analytics?.topVehicles?.[0]?.title || "Pending data"]
          ].map(([Icon, label, value]) => (
            <div key={label} className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
              <Icon className="mb-3 text-neon" size={24} />
              <p className="label">{label}</p>
              <p className="mt-2 text-xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
