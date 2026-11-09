import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { Pagination, Role } from "../types";
import { initials } from "../lib/hooks";

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const end = Number.isFinite(to) ? to : 0;
    if (end === 0) {
      setVal(0);
      return;
    }
    const duration = 600;
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(end * ease));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [to]);

  return <span>{val.toLocaleString("ar-EG") + suffix}</span>;
}

export const Skeleton = ({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    style={style}
    className={`relative overflow-hidden rounded-xl bg-gold-light/40 animate-pulse ${className}`}
  />
);

/**
 * Universal Eye-pleasing Logo Loader with full-screen or container blur
 */
export function LogoLoader({
  text = "جارٍ تحميل البيانات...",
  fullscreen = true,
}: {
  text?: string;
  fullscreen?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center select-none transition-all duration-300 ${
        fullscreen
          ? "fixed inset-0 z-50 bg-wine-deep/35 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
          : "min-h-[300px] w-full rounded-2xl bg-white/40 backdrop-blur-md border border-gold/30 shadow-soft p-8"
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft, comfortable ambient radial glow */}
        <div className="absolute h-36 w-36 rounded-full bg-gold/40 blur-2xl animate-pulse" />
        <div className="absolute h-24 w-24 rounded-full bg-gold-light/50 blur-xl" />

        {/* Radiant Logo */}
        <img
          src="/logo.png"
          alt="أكاديمية حلا"
          className="relative h-20 w-auto object-contain animate-pulse"
          style={{
            filter:
              "drop-shadow(0 0 25px rgba(233, 192, 160, 0.85)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.4))",
          }}
        />
      </div>

      <div className="mt-5 text-center">
        <h4 className="text-base font-bold tracking-wide text-white drop-shadow-md">
          أكاديمية حلا
        </h4>
        <p className="mt-1 text-xs text-gold-light/90 drop-shadow-sm font-medium">
          {text}
        </p>
      </div>

      {/* Gentle soothing progress line */}
      <div className="mt-4 h-1.5 w-36 overflow-hidden rounded-full bg-white/20 border border-white/20">
        <div className="h-full w-full rounded-full bg-gradient-to-r from-wine-velvet via-gold to-gold-light animate-[shimmer_1.6s_infinite]" />
      </div>
    </div>
  );
}

export const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => (
  <div
    style={{ width: size, height: size, minWidth: size }}
    className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-wine to-wine-velvet text-xs font-semibold text-gold ring-1 ring-gold/40 shadow-sm"
  >
    {initials(name)}
  </div>
);

export const RoleBadge = ({ role }: { role: Role }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      role === "ADMIN" ? "bg-wine text-gold-light" : "bg-gold/20 text-wine-deep"
    }`}
  >
    {role === "ADMIN" ? "أدمن" : "مستخدم"}
  </span>
);

export const ErrorBox = ({ msg, retry }: { msg: string; retry: () => void }) => (
  <div className="card flex flex-col items-center gap-3 p-8 text-center">
    <AlertTriangle className="text-wine-velvet" size={28} />
    <p className="text-sm text-wine-deep/80">{msg}</p>
    <button onClick={retry} className="btn-ghost">
      إعادة المحاولة
    </button>
  </div>
);

export const Empty = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center gap-2 p-10 text-gold-dark">
    <Inbox size={30} />
    <p className="text-sm">{text}</p>
  </div>
);

export function PageHead({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-wine-deep">{title}</h1>
        <p className="mt-1 text-sm text-wine-deep/60">{sub}</p>
      </div>
      {children}
    </div>
  );
}

export function Pager({
  p,
  onChange,
}: {
  p: Pagination;
  onChange: (n: number) => void;
}) {
  if (p.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-gold/20 px-5 py-3 text-sm">
      <span className="text-xs text-wine-deep/60">
        صفحة {p.page.toLocaleString("ar-EG")} من {p.totalPages.toLocaleString("ar-EG")}
      </span>
      <div className="flex gap-2">
        <button
          aria-label="السابق"
          disabled={p.page <= 1}
          onClick={() => onChange(p.page - 1)}
          className="btn-ghost !p-2 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
        <button
          aria-label="التالي"
          disabled={p.page >= p.totalPages}
          onClick={() => onChange(p.page + 1)}
          className="btn-ghost !p-2 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}
