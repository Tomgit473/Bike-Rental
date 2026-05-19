export default function LoadingState({ label = "Loading" }) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/10">
      <div className="grid place-items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-neon" />
        <p className="text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}
