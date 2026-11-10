import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  FileText,
  CalendarCheck2,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Avatar } from "./ui";

const nav = [
  { to: "/", label: "نظرة عامة", icon: LayoutDashboard, end: true },
  { to: "/bookings", label: "الحجوزات", icon: CalendarCheck2 },
  { to: "/users", label: "المستخدمين", icon: Users },
  { to: "/applications", label: "الاستمارات", icon: FileText },
];

function Sidebar({
  collapsed,
  onNav,
}: {
  collapsed?: boolean;
  onNav?: () => void;
}) {
  const { user, signOut } = useAuth();
  const go = useNavigate();

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-wine-deep via-wine to-wine-deep text-gold-light border-l border-gold/15 select-none">
      {/* Logo — transparent, and kept clear & nicely sized even when collapsed */}
      <div
        className={`flex items-center justify-center transition-all duration-300 ${
          collapsed ? "py-4 px-1.5" : "py-5 px-4"
        }`}
      >
        <img
          src="/logo.png"
          alt="أكاديمية حلا"
          className={`object-contain transition-all duration-300 ${
            collapsed ? "h-11 w-11 max-w-[48px]" : "h-12 w-auto max-w-[180px]"
          }`}
          style={{
            filter: "brightness(1.15) contrast(1.05) drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
          }}
        />
      </div>

      {/* Nav items */}
      <nav className="mt-3 flex flex-1 flex-col gap-1 px-2.5">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNav}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-white/10 text-gold shadow-sm ring-1 ring-gold/30"
                  : "text-gold-light/75 hover:bg-white/5 hover:text-gold-light"
              }`
            }
          >
            <Icon size={19} className="shrink-0 transition-transform duration-150 group-hover:scale-105" />
            {!collapsed && (
              <span className="truncate">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile & logout */}
      <div
        className={`m-2.5 rounded-2xl bg-white/5 border border-white/10 p-2 transition-all ${
          collapsed ? "flex flex-col items-center gap-2" : "flex items-center gap-2.5"
        }`}
      >
        <Avatar name={user?.name || "A"} size={32} />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gold-light">
              {user?.name}
            </p>
            <p className="truncate text-[11px] text-gold-light/50">
              {user?.email}
            </p>
          </div>
        )}
        <button
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
          onClick={async () => {
            await signOut();
            go("/login");
          }}
          className="rounded-lg p-1.5 text-gold-light/70 hover:bg-white/10 hover:text-gold transition-colors shrink-0"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();

  const sidebarWidth = collapsed ? 68 : 220;

  return (
    <div className="min-h-screen bg-ivory text-wine-deep">
      {/* Desktop sidebar */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="fixed bottom-0 right-0 top-0 z-30 hidden transition-[width] duration-300 ease-in-out lg:block"
      >
        <Sidebar collapsed={collapsed} />

        {/* Toggle Collapse Arrow Button (RTL: on the left border of the right sidebar) */}
        <button
          type="button"
          aria-label={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
          title={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
          onClick={() => setCollapsed((prev) => !prev)}
          className="absolute -left-3.5 top-20 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-wine text-gold shadow-md transition-transform hover:scale-110 hover:bg-wine-velvet focus:outline-none"
        >
          {collapsed ? (
            <ChevronLeft size={16} className="text-gold" />
          ) : (
            <ChevronRight size={16} className="text-gold" />
          )}
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gold/20 bg-wine-deep px-4 py-3 lg:hidden">
        <img
          src="/logo.png"
          alt="أكاديمية حلا"
          className="h-8 object-contain"
          style={{ filter: "brightness(1.15) contrast(1.05)" }}
        />
        <button
          aria-label="القائمة"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 text-gold hover:bg-white/10 transition-colors"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 right-0 top-0 z-50 w-64 lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              <button
                aria-label="إغلاق"
                onClick={() => setMobileOpen(false)}
                className="absolute left-3 top-3 z-10 rounded-full p-1.5 text-gold hover:bg-white/10"
              >
                <X size={18} />
              </button>
              <Sidebar onNav={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main
        style={{ marginRight: `${sidebarWidth}px` }}
        className="hidden min-h-screen px-6 py-8 transition-[margin-right] duration-300 ease-in-out lg:block"
      >
        <div key={loc.pathname} className="mx-auto max-w-7xl animate-[fadeIn_0.2s_ease-out]">
          <Outlet />
        </div>
      </main>

      {/* Mobile Content Area */}
      <main className="min-h-[calc(100vh-56px)] px-4 py-6 sm:px-6 lg:hidden">
        <div key={loc.pathname} className="mx-auto animate-[fadeIn_0.2s_ease-out]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
