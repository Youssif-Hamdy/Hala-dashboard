/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wine: { DEFAULT: "#5C0A18", deep: "#3B0004", velvet: "#700716" },
        gold: { DEFAULT: "#E9C0A0", dark: "#B37A5D", light: "#F6E1C2" },
        ivory: "#FBF6F0",
      },
      fontFamily: { sans: ['"Readex Pro"', "system-ui", "sans-serif"] },
      boxShadow: {
        soft: "0 1px 2px rgba(59,0,4,.06), 0 8px 24px -12px rgba(59,0,4,.18)",
        glow: "0 0 0 1px rgba(233,192,160,.35), 0 12px 40px -12px rgba(112,7,22,.55)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(-100%)" } },
        float: { "0%,100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(0,-26px,0) scale(1.06)" } },
        sheen: { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
      },
      animation: { shimmer: "shimmer 1.6s infinite", float: "float 11s ease-in-out infinite", sheen: "sheen 6s linear infinite" },
    },
  },
  plugins: [],
};
