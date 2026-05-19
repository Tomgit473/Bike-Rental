import { Bike, HeartHandshake, LifeBuoy, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-white/70 py-10 dark:border-white/10 dark:bg-black/15">
      <div className="section grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-neon dark:bg-neon dark:text-ink">
              RL
            </span>
            RideLoop
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
            Verified rentals for quick commutes, tourist trips, weekend drives, and owner-led mobility businesses.
          </p>
        </div>
        <div className="grid gap-3 text-sm">
          <span className="font-bold">Marketplace</span>
          <Link to="/explore" className="text-slate-600 hover:text-electric dark:text-slate-300">Explore rentals</Link>
          <Link to="/owner" className="text-slate-600 hover:text-electric dark:text-slate-300">Owner dashboard</Link>
          <Link to="/dashboard" className="text-slate-600 hover:text-electric dark:text-slate-300">My trips</Link>
        </div>
        <div className="grid gap-3 text-sm">
          <span className="font-bold">Trust</span>
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300"><Bike size={16} /> RC checks</span>
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300"><HeartHandshake size={16} /> Deposit holds</span>
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300"><MapPin size={16} /> Pickup pins</span>
        </div>
        <div className="grid gap-3 text-sm">
          <span className="font-bold">Support</span>
          <button type="button" className="btn-secondary justify-start py-2">
            <LifeBuoy size={16} />
            Emergency help
          </button>
        </div>
      </div>
    </footer>
  );
}
