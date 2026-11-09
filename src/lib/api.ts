import axios from "axios";
import type { Paged, UserRow, UserDetail, Application, AuthUser, Role } from "../types";

// ========================================================
// الـ baseURL بيجي من المتغير VITE_API_URL في .env
// لو مش موجود يرجع string فاضي (للتطوير المحلي مع proxy)
//
// للـ Production على Vercel:
//   حط في Vercel → Project Settings → Environment Variables:
//   VITE_API_URL = https://[رابط-الباك-إند].vercel.app
// ========================================================
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // ضروري عشان الكوكيز HttpOnly تتبعت مع كل request
  headers: { "Content-Type": "application/json" },
});

// لو مفيش BASE محدد في التطوير — اطبع تحذير واضح في الـ console
if (!BASE && import.meta.env.DEV) {
  console.warn(
    "⚠️  VITE_API_URL غير محدد — الطلبات هتتبعت للـ proxy المحلي.\n" +
    "    عشان Production: حط VITE_API_URL=https://[backend].vercel.app في ملف .env"
  );
}

export const errMsg = (e: unknown) =>
  (axios.isAxiosError(e) && (e.response?.data?.message as string)) || "حصل خطأ غير متوقع، جرّب تاني";

const norm = <T,>(d: any, key: string): Paged<T> => ({
  data: d.data ?? d[key] ?? [],
  pagination: d.pagination ?? { total: (d.data ?? d[key] ?? []).length, page: 1, limit: 10, totalPages: 1 },
});

export const adminLogin = (email: string, password: string) =>
  api.post<{ user: AuthUser }>("/api/auth/admin/login", { email, password }).then((r) => r.data.user);
export const logout = () => api.post("/api/auth/logout");

export const getUsers = (page = 1, limit = 10, role?: Role) =>
  api.get("/api/users", { params: { page, limit, ...(role ? { role } : {}) } }).then((r) => norm<UserRow>(r.data, "users"));
export const getUser = (id: string) =>
  api.get(`/api/users/${id}`).then((r) => (r.data.data ?? r.data.user ?? r.data) as UserDetail);
export const deleteUser = (id: string) =>
  api.delete(`/api/users/${id}`);
export const getApplications = (page = 1, limit = 9) =>
  api.get("/api/applications", { params: { page, limit } }).then((r) => norm<Application>(r.data, "applications"));
export const getApplication = (id: string) =>
  api.get(`/api/applications/${id}`).then((r) => r.data.data as Application);

export default api;
