import { MailCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Reset instructions sent");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section grid min-h-[calc(100vh-4rem)] place-items-center py-10">
      <form onSubmit={submit} className="grid w-full max-w-xl gap-5 rounded-lg border border-black/10 bg-white p-6 shadow-panel dark:border-white/10 dark:bg-white/10 md:p-10">
        <div>
          <p className="label">Password recovery</p>
          <h1 className="mt-2 text-3xl font-extrabold">Reset access</h1>
        </div>
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          <MailCheck size={18} />
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <Link to="/login" className="text-sm font-semibold text-electric">Back to login</Link>
      </form>
    </section>
  );
}
