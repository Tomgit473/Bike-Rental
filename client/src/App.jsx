import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import Checkout from "./pages/Checkout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Explore from "./pages/Explore.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import Register from "./pages/Register.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";
import { loadMe } from "./store/authSlice.js";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem("rideLoopToken")) {
      dispatch(loadMe());
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/checkout/:vehicleId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route
          path="/owner"
          element={<ProtectedRoute roles={["owner", "admin"]}><OwnerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute roles={["admin"]}><AdminPanel /></ProtectedRoute>}
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
