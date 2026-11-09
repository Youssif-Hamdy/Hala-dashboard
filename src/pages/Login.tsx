import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { adminLogin, errMsg } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { user, setUser } = useAuth();
  const go = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      setUser(await adminLogin(email.trim(), password));
      go("/");
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-6">
      {/* Background for Desktop / Laptops */}
      <img
        src="/lap.png"
        alt=""
        aria-hidden="true"
        className="hidden md:block pointer-events-none absolute inset-0 h-full w-full object-cover object-center scale-105 filter blur-[3px]"
      />

      {/* Background for Mobile / Phones */}
      <img
        src="/mop.png"
        alt=""
        aria-hidden="true"
        className="block md:hidden pointer-events-none absolute inset-0 h-full w-full object-cover object-center scale-105 filter blur-[3px]"
      />

      {/* Coordinated Luxury Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine-deep/80 via-wine-deep/45 to-wine-deep/60 backdrop-blur-[1px]" />

      {/* Subtle ambient light glows in corners */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-gold-dark/25 blur-3xl" />

      {/* Glassmorphic Form Card: more compact & more transparent on mobile */}
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-[335px] sm:max-w-md rounded-3xl bg-white/10 sm:bg-white/20 p-5 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-xl border border-white/20 sm:border-white/40 transition-all"
      >
        {/* Radiant / Glowing Logo */}
        <div className="relative flex justify-center mb-3">
          {/* Luminous Halo */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-36 rounded-full bg-gold/50 blur-2xl animate-pulse" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-24 rounded-full bg-gold-light/65 blur-lg" />
          <img
            src="/logo.png"
            alt="أكاديمية حلا"
            className="relative h-18 sm:h-20 object-contain drop-shadow-[0_0_20px_rgba(246,225,194,0.95)] drop-shadow-[0_0_35px_rgba(233,192,160,0.8)]"
          />
        </div>

        <div className="mx-auto mb-4 h-px w-20 bg-gradient-to-r from-transparent via-gold-light to-transparent" />
        <h1 className="text-center text-xl sm:text-2xl font-bold text-wine-deep tracking-tight">
          دخول الأدمن
        </h1>
        <p className="mb-5 sm:mb-6 mt-1 text-center text-xs text-wine-deep/80 font-medium">
          لوحة تحكم إدارة أكاديمية حلا
        </p>

        <label className="mb-3.5 block">
          <span className="mb-1 block text-xs font-semibold text-wine-deep">
            البريد الإلكتروني
          </span>
          <div className="relative">
            <Mail
              size={15}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wine-deep/60"
            />
            <input
              className="input !bg-white/25 sm:!bg-white/35 !border-white/30 sm:!border-white/50 !text-wine-deep placeholder:!text-wine-deep/45 focus:!bg-white/60 focus:!border-gold backdrop-blur-md pr-10 py-2.5 text-xs sm:text-sm"
              dir="ltr"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hala.com"
              autoComplete="username"
            />
          </div>
        </label>

        <label className="mb-2 block">
          <span className="mb-1 block text-xs font-semibold text-wine-deep">
            كلمة المرور
          </span>
          <div className="relative">
            <Lock
              size={15}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-wine-deep/60"
            />
            <input
              className="input !bg-white/25 sm:!bg-white/35 !border-white/30 sm:!border-white/50 !text-wine-deep placeholder:!text-wine-deep/45 focus:!bg-white/60 focus:!border-gold backdrop-blur-md px-10 py-2.5 text-xs sm:text-sm"
              dir="ltr"
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label="إظهار الباسورد"
              onClick={() => setShow(!show)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-wine-deep/60 hover:text-wine-deep transition-colors"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>

        {err && (
          <div className="mt-3 rounded-xl bg-red-50/90 backdrop-blur-sm p-2.5 text-xs text-red-700 font-semibold border border-red-200">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-primary mt-5 sm:mt-6 w-full !py-2.5 sm:!py-3 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-glow"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
