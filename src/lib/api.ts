import axios from "axios";
import type { Paged, UserRow, UserDetail, Application, AuthUser, Role } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  withCredentials: true, // الكوكيز HttpOnly — لازم تتبعت مع كل request
  headers: { "Content-Type": "application/json" },
});

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
