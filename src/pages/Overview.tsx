import { CalendarCheck2, CheckCircle2, FileText, Users } from "lucide-react";
import { useMemo } from "react";
import { getApplications, getBookings, getUsers } from "../lib/api";
import { fmtDate, useFetch } from "../lib/hooks";
import { Avatar, CountUp, ErrorBox, LogoLoader, PageHead } from "../components/ui";

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function Overview() {
  const u = useFetch(() => getUsers(1, 100), []);
  const a = useFetch(() => getApplications(1, 4), []);
  const b = useFetch(() => getBookings(1, 4), []);

  const stats = useMemo(() => {
    const rows = u.data?.data ?? [];
    const total = u.data?.pagination?.total ?? rows.length;
    const withApp = rows.filter((r) => Boolean(r.application)).length;

    // Generate last 7 days safely
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const week = days.map((d) => {
      const targetStr = d.toDateString();
      const count = rows.filter((r) => {
        if (!r.createdAt) return false;
        const rowDate = new Date(r.createdAt);
        return !isNaN(rowDate.getTime()) && rowDate.toDateString() === targetStr;
      }).length;
      return { label: DAYS[d.getDay()], n: count };
    });

    return {
      total,
      withApp,
      pct: rows.length > 0 ? Math.round((withApp / rows.length) * 100) : 0,
      week,
      recent: rows.slice(0, 5),
    };
  }, [u.data]);

  if (u.error) return <ErrorBox msg={u.error} retry={u.retry} />;

  // Comfortable Logo Loader with full-screen blur while data loads
  if (u.loading && !u.data) {
    return <LogoLoader fullscreen text="جارٍ تحميل لوحة التحكم والبيانات..." />;
  }

  const max = Math.max(1, ...stats.week.map((w) => w.n));

  const cards = [
    { label: "إجمالي المستخدمين", v: stats.total, icon: Users, isPrimary: true },
    { label: "طلبات الحجز", v: b.data?.pagination?.total ?? 0, icon: CalendarCheck2 },
    { label: "إجمالي الاستمارات", v: a.data?.pagination?.total ?? 0, icon: FileText },
    { label: "قدّموا استمارة", v: stats.withApp, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      <PageHead title="أهلاً بيك" sub="ملخص سريع لنشاط الأكاديمية" />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`card relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 ${
              c.isPrimary
                ? "!border-0 !bg-gradient-to-br from-wine to-wine-velvet !text-gold-light shadow-glow"
                : "hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${c.isPrimary ? "text-gold-light/80" : "text-wine-deep/60"}`}>
                {c.label}
              </span>
              <c.icon
                size={20}
                className={c.isPrimary ? "text-gold" : "text-gold-dark"}
              />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight">
              <CountUp to={c.v} />
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid: Registrations chart & Recent users */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Registrations Chart */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-wine-deep">تسجيلات آخر ٧ أيام</h2>
            <span className="text-xs text-wine-deep/50">تحديث تلقائي</span>
          </div>
          <div className="mt-8 flex h-52 items-end gap-3 pt-6">
            {stats.week.map((w, i) => {
              const heightPct = Math.max(8, Math.round((w.n / max) * 100));
              return (
                <div
                  key={i}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-medium text-gold-dark opacity-80 group-hover:opacity-100 transition-opacity">
                    {w.n.toLocaleString("ar-EG")}
                  </span>
                  <div className="relative w-full h-full flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-wine to-gold-dark transition-all duration-500 ease-out group-hover:brightness-110"
                    />
                  </div>
                  <span className="text-[11px] text-wine-deep/60">{w.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent users */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-wine-deep">أحدث المستخدمين</h2>
          </div>
          <ul className="space-y-3">
            {stats.recent.length === 0 ? (
              <p className="text-xs text-wine-deep/50 py-4 text-center">لا يوجد مستخدمين مسجلين بعد</p>
            ) : (
              stats.recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gold-light/20"
                >
                  <Avatar name={r.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-wine-deep">
                      {r.name}
                    </p>
                    <p className="text-xs text-wine-deep/50">
                      {fmtDate(r.createdAt)}
                    </p>
                  </div>
                  {r.application && (
                    <span
                      title="قدّم استمارة"
                      className="flex items-center text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
                    >
                      <CheckCircle2 size={13} className="ml-1" />
                      استمارة
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
