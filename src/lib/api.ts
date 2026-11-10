import axios from "axios";
import type {
  Paged,
  UserRow,
  UserDetail,
  Application,
  AuthUser,
  Role,
  Booking,
  BookingStatus,
} from "../types";

// ========================================================
// الـ baseURL بيجي من المتغير VITE_API_URL في .env
// للـ Production على Vercel:
//   Project Settings → Environment Variables → VITE_API_URL
// ========================================================
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

if (!BASE && import.meta.env.DEV) {
  console.warn(
    "⚠️  VITE_API_URL غير محدد — الطلبات هتتبعت للـ proxy المحلي.\n" +
    "    عشان Production: حط VITE_API_URL=https://hala-backend-six.vercel.app في ملف .env"
  );
}

// ========================================================
// Token helpers — يخزن الـ JWT في localStorage
// ========================================================
const TOKEN_KEY = "hala_token";

export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken  = ()              => localStorage.getItem(TOKEN_KEY);
export const clearToken = ()             => localStorage.removeItem(TOKEN_KEY);

// ========================================================
// Axios instance
// ========================================================
const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // للكوكيز HttpOnly (fallback)
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: يلحق Bearer token مع كل طلب ──
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: لو 401 امسح التوكن ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(err);
  }
);

// ========================================================
// Helpers
// ========================================================
export const errMsg = (e: unknown) =>
  (axios.isAxiosError(e) && (e.response?.data?.message as string)) ||
  "حصل خطأ غير متوقع، جرّب تاني";

const norm = <T,>(d: any, key: string): Paged<T> => {
  const list = d?.data ?? d?.[key] ?? (Array.isArray(d) ? d : []);
  return {
    data: Array.isArray(list) ? list : [],
    pagination: d?.pagination ?? {
      total: Array.isArray(list) ? list.length : 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };
};

// ========================================================
// Auth endpoints
// ========================================================
export const adminLogin = async (email: string, password: string): Promise<AuthUser> => {
  const r = await api.post<{ user: AuthUser; token?: string }>("/api/auth/admin/login", {
    email,
    password,
  });
  // لو الباك إند بعت token في الـ response احفظه
  if (r.data.token) {
    saveToken(r.data.token);
  }
  return r.data.user;
};

export const logout = async () => {
  try {
    await api.post("/api/auth/logout");
  } finally {
    clearToken(); // امسح التوكن دايماً سواء الـ request نجح أو لأ
  }
};

// ========================================================
// Users endpoints
// ========================================================
export const getUsers = (page = 1, limit = 10, role?: Role) =>
  api
    .get("/api/users", { params: { page, limit, ...(role ? { role } : {}) } })
    .then((r) => norm<UserRow>(r.data, "users"));

export const getUser = (id: string) =>
  api
    .get(`/api/users/${id}`)
    .then((r) => (r.data.data ?? r.data.user ?? r.data) as UserDetail);

export const deleteUser = (id: string) => api.delete(`/api/users/${id}`);

// ========================================================
// Applications endpoints
// ========================================================
export const getApplications = (page = 1, limit = 9) =>
  api
    .get("/api/applications", { params: { page, limit } })
    .then((r) => norm<Application>(r.data, "applications"));

export const getApplication = (id: string) =>
  api
    .get(`/api/applications/${id}`)
    .then((r) => r.data.data as Application);

// ========================================================
// Bookings endpoints
// ========================================================
export const getBookings = (page = 1, limit = 10, status?: BookingStatus) =>
  api
    .get("/api/bookings", { params: { page, limit, ...(status ? { status } : {}) } })
    .then((r) => norm<Booking>(r.data, "bookings"));

export const updateBookingStatus = (id: string, status: BookingStatus) =>
  api.patch(`/api/bookings/${id}/status`, { status });

export const deleteBooking = (id: string) =>
  api.delete(`/api/bookings/${id}`);

export default api;
