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
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const hours = Math.max(1, Math.ceil((end - start) / 36e5));
    const units = form.rentalType === "weekly" ? Math.ceil(hours / 168) : form.rentalType === "daily" ? Math.ceil(hours / 24) : hours;
    const key = form.rentalType === "weekly" ? "week" : form.rentalType === "daily" ? "day" : "hour";
    const base = (vehicle.pricing?.[key] || 0) * units;
    const platformFee = Math.round(base * 0.05);
    const taxes = Math.round((base + platformFee) * 0.18);
    const coupon = form.couponCode.trim().toUpperCase();
    const discount = coupon === "RIDE10" ? Math.min(500, Math.round(base * 0.1)) : 0;
    const total = Math.max(0, base + platformFee + taxes + (vehicle.securityDeposit || 0) - discount);
    return { hours, units, base, platformFee, taxes, discount, total };
  }, [form, vehicle]);

  const validationError = useMemo(() => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Pick valid pickup and return dates.";
    if (end <= start) return "Return must be after pickup.";
    if (start.getTime() < Date.now() - 60 * 1000) return "Pickup cannot be in the past.";
    return null;
  }, [form.startDate, form.endDate]);

  const [submitting, setSubmitting] = useState(false);
  const [mockNote, setMockNote] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (validationError || submitting) return;
    setSubmitting(true);

    let bookingId = null;
    try {
      const bookingResponse = await dispatch(
        createBooking({
          vehicleId,
          rentalType: form.rentalType,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          couponCode: form.couponCode.trim().toUpperCase() || undefined,
          pickupLocation: { address: vehicle.pickupAddress, coordinates: vehicle.location?.coordinates },
          returnLocation: { address: vehicle.pickupAddress, coordinates: vehicle.location?.coordinates }
        })
      ).unwrap();
      bookingId = bookingResponse.booking._id;

      const checkoutResponse = await dispatch(
        createCheckout({
          bookingId,
          provider: form.provider
        })
      ).unwrap();

      if (checkoutResponse?.providerPayload?.mock) setMockNote(true);
      toast.success(
        checkoutResponse?.providerPayload?.mock
          ? "Booking created (mock payment — no real charge)"
          : "Booking and payment session created"
      );
      navigate("/dashboard");
    } catch (error) {
      if (bookingId) {
        toast.error(`Booking saved but payment failed: ${error.message}. Find it under Dashboard to retry.`);
        navigate("/dashboard");
      } else {
        toast.error(error.message);
      }
    } finally {
      setSubmitting(false);
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
              <div className="flex justify-between"><span>Rental ({estimate.units} {form.rentalType === "hourly" ? "hrs" : form.rentalType === "weekly" ? "wks" : "days"})</span><strong>INR {estimate.base.toLocaleString("en-IN")}</strong></div>
              <div className="flex justify-between"><span>Platform fee</span><strong>INR {estimate.platformFee.toLocaleString("en-IN")}</strong></div>
              <div className="flex justify-between"><span>Taxes</span><strong>INR {estimate.taxes.toLocaleString("en-IN")}</strong></div>
              <div className="flex justify-between"><span>Deposit hold</span><strong>INR {vehicle.securityDeposit?.toLocaleString("en-IN")}</strong></div>
              {estimate.discount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-neon"><span>Coupon RIDE10</span><strong>- INR {estimate.discount.toLocaleString("en-IN")}</strong></div>
              )}
              <div className="border-t border-black/10 pt-3 text-lg dark:border-white/10">
                <div className="flex justify-between"><span>Total</span><strong>INR {estimate.total.toLocaleString("en-IN")}</strong></div>
              </div>
              <p className="text-xs text-slate-500">Estimate only. Final total is confirmed by the server at booking.</p>
              {mockNote && <p className="text-xs font-bold text-amber-600">Mock payment mode — no real charge.</p>}
            </div>
          )}
          {validationError && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">{validationError}</p>
          )}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={submitting || Boolean(validationError)}>
            {submitting ? "Creating..." : "Create booking"}
          </button>
        </aside>
      </form>
    </section>
  );
}
