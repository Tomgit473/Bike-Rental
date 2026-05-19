import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section grid min-h-[calc(100vh-4rem)] place-items-center py-10 text-center">
      <div className="max-w-xl">
        <p className="label">404</p>
        <h1 className="mt-3 text-4xl font-extrabold">This route is not parked here</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Head back to the marketplace and pick a ride that is actually listed.
        </p>
        <Link to="/explore" className="btn-primary mt-6">
          Explore rentals
        </Link>
      </div>
    </section>
  );
}
