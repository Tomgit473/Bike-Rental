export default function StatCard({ label, value, delta }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-panel dark:border-white/10 dark:bg-white/10">
      <p className="label">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-3xl font-extrabold">{value}</p>
        {delta && <span className="rounded-lg bg-neon/15 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-neon">{delta}</span>}
      </div>
    </div>
  );
}
