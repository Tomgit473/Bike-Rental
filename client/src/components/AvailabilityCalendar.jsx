import { addDays, format } from "date-fns";

export default function AvailabilityCalendar() {
  const days = Array.from({ length: 14 }, (_, index) => addDays(new Date(), index));

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => {
        const blocked = index === 5 || index === 9;
        return (
          <div
            key={day.toISOString()}
            className={`grid aspect-square place-items-center rounded-lg border text-center text-xs ${
              blocked
                ? "border-red-200 bg-red-50 text-red-500 dark:border-red-500/30 dark:bg-red-500/10"
                : "border-black/10 bg-white text-ink dark:border-white/10 dark:bg-white/10 dark:text-white"
            }`}
          >
            <span className="font-bold">{format(day, "d")}</span>
            <span>{format(day, "EEE")}</span>
          </div>
        );
      })}
    </div>
  );
}
