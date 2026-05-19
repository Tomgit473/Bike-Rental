import { MapPin, Navigation } from "lucide-react";

export default function MapPreview({ vehicles = [] }) {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-black/10 bg-[#d7efe9] shadow-panel dark:border-white/10 dark:bg-[#0d2530]">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-0 top-1/4 h-px w-full rotate-6 bg-white/70 dark:bg-white/10" />
        <div className="absolute left-0 top-2/3 h-px w-full -rotate-12 bg-white/70 dark:bg-white/10" />
        <div className="absolute left-1/3 top-0 h-full w-px rotate-12 bg-white/70 dark:bg-white/10" />
        <div className="absolute left-2/3 top-0 h-full w-px -rotate-6 bg-white/70 dark:bg-white/10" />
      </div>
      <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-bold text-ink shadow dark:bg-ink/90 dark:text-white">
        <Navigation size={16} className="text-electric" />
        Nearby
      </div>
      {vehicles.slice(0, 6).map((vehicle, index) => (
        <div
          key={vehicle._id}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${24 + ((index * 19) % 58)}%`,
            top: `${28 + ((index * 23) % 54)}%`
          }}
        >
          <div className="group relative">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-neon shadow-glow dark:bg-neon dark:text-ink">
              <MapPin size={21} />
            </span>
            <div className="pointer-events-none absolute left-1/2 top-12 hidden w-48 -translate-x-1/2 rounded-lg bg-white p-3 text-xs shadow-panel group-hover:block dark:bg-ink">
              <p className="font-bold">{vehicle.title}</p>
              <p className="mt-1 text-slate-500">INR {vehicle.pricing?.day?.toLocaleString("en-IN")} per day</p>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 right-4 z-10 grid grid-cols-3 gap-2">
        {["2.4 km", "12 min", "Live pins"].map((value) => (
          <div key={value} className="rounded-lg bg-white/85 px-3 py-2 text-center text-sm font-bold text-ink dark:bg-ink/85 dark:text-white">
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}
