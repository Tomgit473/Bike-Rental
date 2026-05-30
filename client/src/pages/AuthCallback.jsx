import { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingState from "../components/LoadingState.jsx";
import { setOAuthSession } from "../store/authSlice.js";

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const rawUser = searchParams.get("user");

    if (!token || !rawUser) {
      toast.error("Google sign-in could not be completed.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      dispatch(setOAuthSession({ token, user }));
      toast.success("Signed in with Google");
      navigate("/dashboard", { replace: true });
    } catch (_error) {
      toast.error("Google sign-in response was invalid.");
      navigate("/login", { replace: true });
    }
  }, [dispatch, navigate, searchParams]);

  return (
    <section className="section py-16">
      <LoadingState label="Completing sign-in" />
    </section>
  );
}
