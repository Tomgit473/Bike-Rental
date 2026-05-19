import { NavLink } from "react-router-dom";

export default function DashboardShell({ title, eyebrow, actions, children }) {
  return (
    <section className="section py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          {eyebrow && <p className="label">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{title}</h1>
        </div>
        {actions}
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {[
          ["Dashboard", "/dashboard"],
          ["Owner", "/owner"],
          ["Admin", "/admin"]
        ].map(([label, to]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `shrink-0 rounded-lg px-4 py-2 text-sm font-bold ${
                isActive
                  ? "bg-ink text-white dark:bg-neon dark:text-ink"
                  : "bg-white text-slate-600 dark:bg-white/10 dark:text-slate-300"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
      {children}
    </section>
  );
}
