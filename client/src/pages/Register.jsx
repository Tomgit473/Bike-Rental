import { UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../store/authSlice.js";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state) => state.auth.status);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "renter",
    password: ""
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      await dispatch(register(form)).unwrap();
      toast.success("Account created");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="section grid min-h-[calc(100vh-4rem)] place-items-center py-10">
      <form onSubmit={submit} className="grid w-full max-w-2xl gap-5 rounded-lg border border-black/10 bg-white p-6 shadow-panel dark:border-white/10 dark:bg-white/10 md:p-10">
        <div>
          <p className="label">Register</p>
          <h1 className="mt-2 text-3xl font-extrabold">Join RideLoop</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="label">Name</span>
            <input className="input" value={form.name} onChange={(event) => update("name", event.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span className="label">Phone</span>
            <input className="input" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input className="input" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="label">Role</span>
            <select className="input" value={form.role} onChange={(event) => update("role", event.target.value)}>
              <option value="renter">Renter</option>
              <option value="owner">Vehicle owner</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label">Password</span>
            <input className="input" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required minLength={8} />
          </label>
        </div>
        <button type="submit" className="btn-primary" disabled={status === "loading"}>
          <UserPlus size={18} />
          {status === "loading" ? "Creating..." : "Create account"}
        </button>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Already registered? <Link to="/login" className="font-semibold text-electric">Login</Link>
        </p>
      </form>
    </section>
  );
}
