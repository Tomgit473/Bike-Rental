import { CalendarDays, CreditCard, Heart, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import DashboardShell from "../components/DashboardShell.jsx";
import StatCard from "../components/StatCard.jsx";
import VehicleCard from "../components/VehicleCard.jsx";
import { api } from "../services/api.js";
import { fetchBookings } from "../store/bookingSlice.js";
import { featuredVehicles } from "../data/mockData.js";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const bookings = useSelector((state) => state.bookings.items);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    dispatch(fetchBookings());
    api
      .get("/users/dashboard")
      .then(({ data }) => setDashboard(data.dashboard))
      .catch((error) => toast.error(error.message));
  }, [dispatch]);

  return (
    <DashboardShell title={`Hi, ${user?.name?.split(" ")[0] || "rider"}`} eyebrow="Renter dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Trips" value={dashboard?.stats?.renterTrips ?? bookings.length} delta="+2" />
        <StatCard label="Wallet" value={`INR ${user?.walletBalance || 0}`} />
        <StatCard label="Trust score" value={user?.trustedScore || 70} delta={user?.kycStatus || "pending"} />
        <StatCard label="Favorites" value={user?.favoriteVehicles?.length || 0} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
          <h2 className="mb-4 text-2xl font-extrabold">Recent bookings</h2>
          <div className="grid gap-3">
            {(bookings.length ? bookings : dashboard?.renterBookings || []).slice(0, 5).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between gap-4 rounded-lg bg-slate-100 p-3 dark:bg-white/10">
                <div className="flex items-center gap-3">
                  <CalendarDays className="text-electric" size={20} />
                  <div>
                    <p className="font-bold">{booking.vehicle?.title || booking.invoiceNumber}</p>
                    <p className="text-sm text-slate-500">{booking.status} - {booking.paymentStatus}</p>
                  </div>
                </div>
                <strong>INR {booking.priceBreakdown?.total?.toLocaleString("en-IN") || 0}</strong>
              </div>
            ))}
            {!bookings.length && !dashboard?.renterBookings?.length && (
              <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
                Your bookings will appear here after checkout.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {[
            [ShieldCheck, "KYC", user?.kycStatus || "not started"],
            [CreditCard, "Payments", "Stripe/Razorpay ready"],
            [Heart, "Wishlist", `${user?.favoriteVehicles?.length || 0} saved`]
          ].map(([Icon, label, value]) => (
            <div key={label} className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
              <Icon size={22} className="mb-4 text-neon" />
              <p className="label">{label}</p>
              <p className="mt-2 text-xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-extrabold">Recommended rides</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
