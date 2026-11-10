export type Role = "USER" | "ADMIN";
export type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AppRef {
  id: string;
  createdAt: string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  application: AppRef | null;
}

export interface Application {
  id: string;
  name: string;
  currentChallenges: string;
  courseGoal: string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface UserDetail extends Omit<UserRow, "application"> {
  application: Application | null;
}

export interface Booking {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  date?: string;
  bookingDate?: string;
  time?: string;
  service?: string;
  course?: string;
  notes?: string;
  message?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; name: string; email: string; phone?: string };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paged<T> {
  data: T[];
  pagination: Pagination;
}
