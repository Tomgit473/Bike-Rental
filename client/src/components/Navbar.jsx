import { Menu, ShieldCheck, User, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { logout } from "../store/authSlice.js";
import ThemeToggle from "./ThemeToggle.jsx";

const navItems = [
  { to: "/explore", label: "Explore" },
  { to: "/owner", label: "List vehicle" },
  { to: "/dashboard", label: "Trips" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-ink/85">
      <nav className="section flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold" aria-label="RideLoop home">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-neon shadow-glow dark:bg-neon dark:text-ink">
            RL
          </span>
          <span className="text-lg">RideLoop</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-neon/20 text-ink dark:text-neon"
                    : "text-slate-600 hover:bg-black/5 hover:text-ink dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-electric hover:bg-electric/10"
            >
              <ShieldCheck size={16} />
              Admin
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="btn-secondary py-2">
                <User size={16} />
                {user.name?.split(" ")[0]}
              </Link>
              <button type="button" className="btn-primary py-2" onClick={() => dispatch(logout())}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white md:hidden dark:border-white/10 dark:bg-white/10"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="section pb-4 md:hidden">
          <div className="glass grid gap-2 rounded-lg p-3 shadow-panel">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10"
              >
                {item.label}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold">
                Admin
              </NavLink>
            )}
            <div className="flex items-center gap-2 border-t border-black/10 pt-3 dark:border-white/10">
              <ThemeToggle />
              {user ? (
                <button type="button" className="btn-primary flex-1 py-2" onClick={() => dispatch(logout())}>
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1 py-2">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary flex-1 py-2">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
