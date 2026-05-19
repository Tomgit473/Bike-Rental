import { LogIn } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../services/api.js";
import { login } from "../store/authSlice.js";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector((state) => state.auth.status);
  const [form, setForm] = useState({ email: "renter@rideloop.dev", password: "Password123!" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await dispatch(login(form)).unwrap();
      toast.success("Welcome back");
      navigate(location.state?.from || "/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="section grid min-h-[calc(100vh-4rem)] place-items-center py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-black/10 bg-white shadow-panel dark:border-white/10 dark:bg-white/10 md:grid-cols-2">
        <div className="relative hidden min-h-[560px] md:block">
          <img
            src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"
            alt="Rider on a motorcycle"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/35" />
        </div>
        <form onSubmit={submit} className="grid gap-5 p-6 md:p-10">
          <div>
            <p className="label">Sign in</p>
            <h1 className="mt-2 text-3xl font-extrabold">Access your rentals</h1>
          </div>
          <label className="grid gap-1">
            <span className="label">Email</span>
            <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="grid gap-1">
            <span className="label">Password</span>
            <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <button type="submit" className="btn-primary" disabled={status === "loading"}>
            <LogIn size={18} />
            {status === "loading" ? "Signing in..." : "Login"}
          </button>
          <a href={`${API_URL}/auth/google`} className="btn-secondary">
            Continue with Google
          </a>
          <div className="flex flex-wrap justify-between gap-3 text-sm">
            <Link to="/forgot-password" className="font-semibold text-electric">Forgot password?</Link>
            <Link to="/register" className="font-semibold text-electric">Create account</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
