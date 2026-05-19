import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("rideLoopTheme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("rideLoopTheme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      type="button"
      className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white text-ink transition hover:border-neon dark:border-white/10 dark:bg-white/10 dark:text-white"
      onClick={() => setDark((value) => !value)}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
