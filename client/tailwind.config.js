/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f14",
        cloud: "#f8fafc",
        neon: "#35f28f",
        electric: "#39a7ff"
      },
      boxShadow: {
        glow: "0 0 32px rgba(53, 242, 143, 0.24)",
        panel: "0 18px 80px rgba(7, 12, 20, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
