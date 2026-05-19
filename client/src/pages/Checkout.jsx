import { addDays, formatISO } from "date-fns";
import { CreditCard, ReceiptText, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import LoadingState from "../components/LoadingState.jsx";
import { createBooking, createCheckout } from "../store/bookingSlice.js";
import { fetchVehicle } from "../store/vehicleSlice.js";

export default function Checkout() {
  const { vehicleId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const vehicle = useSelector((state) => state.vehicles.selected);
  const bookingStatus = useSelector((state) => state.bookings.status);
  const [form, setForm] = useState({
    rentalType: "daily",
    startDate: formatISO(addDays(new Date(), 1)).slice(0, 16),
    endDate: formatISO(addDays(new Date(), 2)).slice(0, 16),
    provider: "stripe",
    couponCode: "RIDE10"
  });

  useEffect(() => {
    dispatch(fetchVehicle(vehicleId));
  }, [dispatch, vehicleId]);

  const estimate = useMemo(() => {
    if (!vehicle) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const hours = Math.max(1, Math.ceil((end - start) / 36e5));
    const units = form.rentalType === "weekly" ? Math.ceil(hours / 168) : form.rentalType === "daily" ? Math.ceil(hours / 24) : hours;
    const key = form.rentalType === "weekly" ? "week" : form.rentalType === "daily" ? "day" : "hour";
    const base = (vehicle.pricing?.[key] || 0) * units;
    const platformFee = Math.round(base * 0.05);
    const taxes = Math.round((base + platformFee) * 0.18);
    const total = base + platformFee + taxes + (vehicle.securityDeposit || 0);
    return { hours, units, base, platformFee, taxes, total };
  }, [form, vehicle]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();

    try {
      const bookingResponse = await dispatch(
        createBooking({
          vehicleId,
          rentalType: form.rentalType,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          couponCode: form.couponCode,
          pickupLocation: { address: vehicle.pickupAddress, coordinates: vehicle.location?.coordinates },
          returnLocation: { address: vehicle.pickupAddress, coordinates: vehicle.location?.coordinates }
        })
      ).unwrap();

      await dispatch(
        createCheckout({
          bookingId: bookingResponse.booking._id,
          provider: form.provider
        })
      ).unwrap();

      toast.success("Booking and payment session created");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!vehicle) return <section className="section py-8"><LoadingState label="Preparing checkout" /></section>;

  return (
    <section className="section py-8">
      <div className="mb-6">
        <p className="label">Checkout</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">{vehicle.title}</h1>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5 rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1">
              <span className="label">Rental type</span>
              <select className="input" value={form.rentalType} onChange={(event) => update("rentalType", event.target.value)}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="label">Pickup</span>
              <input className="input" type="datetime-local" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="label">Return</span>
              <input className="input" type="datetime-local" value={form.endDate} onChange={(event) => update("endDate", event.target.value)} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="label">Payment</span>
              <select className="input" value={form.provider} onChange={(event) => update("provider", event.target.value)}>
                <option value="stripe">Stripe</option>
                <option value="razorpay">Razorpay</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="label">Coupon</span>
              <input className="input" value={form.couponCode} onChange={(event) => update("couponCode", event.target.value.toUpperCase())} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              [ShieldCheck, "Verified owner"],
              [CreditCard, "Deposit hold"],
              [ReceiptText, "Invoice generated"]
            ].map(([Icon, label]) => (
              <div key={label} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-3 text-sm font-bold dark:bg-white/10">
                <Icon size={18} className="text-neon" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10 lg:self-start">
          <img src={vehicle.images?.[0]?.url} alt={vehicle.title} className="mb-4 aspect-[4/3] w-full rounded-lg object-cover" />
          <h2 className="text-xl font-extrabold">Price summary</h2>
          {estimate && (
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between"><span>Rental</span><strong>INR {estimate.base.toLocaleString("en-IN")}</strong></div>
              <div className="flex justify-between"><span>Platform fee</span><strong>INR {estimate.platformFee.toLocaleString("en-IN")}</strong></div>
              <div className="flex justify-between"><span>Taxes</span><strong>INR {estimate.taxes.toLocaleString("en-IN")}</strong></div>
              <div className="flex justify-between"><span>Deposit hold</span><strong>INR {vehicle.securityDeposit?.toLocaleString("en-IN")}</strong></div>
              <div className="border-t border-black/10 pt-3 text-lg dark:border-white/10">
                <div className="flex justify-between"><span>Total</span><strong>INR {estimate.total.toLocaleString("en-IN")}</strong></div>
              </div>
            </div>
          )}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={bookingStatus === "loading"}>
            {bookingStatus === "loading" ? "Creating..." : "Create booking"}
          </button>
        </aside>
      </form>
    </section>
  );
}
