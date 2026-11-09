import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthUser } from "../types";
import { logout as apiLogout } from "./api";

const KEY = "hala_admin";
interface Ctx { user: AuthUser | null; setUser: (u: AuthUser | null) => void; signOut: () => Promise<void> }
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, set] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  });
  const setUser = (u: AuthUser | null) => {
    set(u);
    u ? localStorage.setItem(KEY, JSON.stringify(u)) : localStorage.removeItem(KEY);
  };
  const signOut = async () => { try { await apiLogout(); } finally { setUser(null); } };
  return <AuthCtx.Provider value={{ user, setUser, signOut }}>{children}</AuthCtx.Provider>;
}
