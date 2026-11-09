import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// الـ proxy بيخلي الكوكيز تشتغل بدون مشاكل CORS أثناء التطوير
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "https://hala-backend-six.vercel.app/" } },
});
