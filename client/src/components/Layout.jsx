import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-cloud text-ink transition-colors dark:bg-ink dark:text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          className: "text-sm",
          style: {
            borderRadius: "8px"
          }
        }}
      />
    </div>
  );
}
