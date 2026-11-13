import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  Hourglass,
  Loader2,
  Mail,
  Phone,
  Search,
  Timer,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  deleteConsultation,
  errMsg,
  getConsultations,
  updateConsultationStatus,
} from "../lib/api";
import { fmtDate, useFetch } from "../lib/hooks";
import type { Consultation, ConsultationStatus } from "../types";
import Drawer from "../components/Drawer";
import {
  Avatar,
  ConsultationStatusBadge,
  Empty,
  ErrorBox,
  LogoLoader,
  PageHead,
  Pager,
  Skeleton,
} from "../components/ui";

const statusFilters: { k: ConsultationStatus | ""; label: string }[] = [
  { k: "", label: "الكل" },
  { k: "PENDING", label: "معلّق" },
  { k: "ACCEPTED", label: "مقبول" },
  { k: "COMPLETED", label: "مكتمل" },
  { k: "CANCELLED", label: "ملغي" },
];

const durationFilters: { k: number | 0; label: string }[] = [
  { k: 0, label: "كل المدد" },
  { k: 30, label: "٣٠ دقيقة" },
  { k: 45, label: "٤٥ دقيقة" },
  { k: 60, label: "٦٠ دقيقة" },
];

export default function Consultations() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ConsultationStatus | "">("");
  const [durationFilter, setDurationFilter] = useState<number>(0);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Consultation | null>(null);

  // Status updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Delete state
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { data, loading, error, retry } = useFetch(
    () =>
      getConsultations(
        page,
        10,
        statusFilter || undefined,
        durationFilter > 0 ? durationFilter : undefined,
        q.trim() || undefined
      ),
    [page, statusFilter, durationFilter, q]
  );

  const consultations = data?.data ?? [];

  // Summary counts from current data
  const stats = {
    pending: consultations.filter((c) => c.status === "PENDING").length,
    accepted: consultations.filter((c) => c.status === "ACCEPTED").length,
    completed: consultations.filter((c) => c.status === "COMPLETED").length,
    cancelled: consultations.filter((c) => c.status === "CANCELLED").length,
  };

  // Status change handler
  const handleStatusChange = async (c: Consultation, newStatus: ConsultationStatus) => {
    if (c.status === newStatus || updatingId) return;
    try {
      setUpdatingId(c.id);
      setActionError("");
      await updateConsultationStatus(c.id, newStatus);
      if (sel?.id === c.id) {
        setSel({ ...sel, status: newStatus });
      }
      retry();
    } catch (err) {
      setActionError(errMsg(err));
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete handler
  const confirmDelete = async () => {
    if (!consultationToDelete) return;
    try {
      setDeleting(true);
      setDeleteError("");
      await deleteConsultation(consultationToDelete.id);
      if (sel?.id === consultationToDelete.id) {
        setSel(null);
      }
      setConsultationToDelete(null);
      retry();
    } catch (err) {
      setDeleteError(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHead
        title="إدارة الاستشارات"
        sub={`${(data?.pagination.total ?? 0).toLocaleString("ar-EG")} طلب استشارة إجمالي`}
      >
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-dark"
          />
          <input
            className="input pr-11"
            placeholder="ابحث بالاسم، الهاتف، أو الإيميل..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </PageHead>

      {/* Filter Chips & Duration Filter & Quick Summary */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-white/60 border border-gold/30 rounded-xl w-fit">
            {statusFilters.map((f) => {
              const active = statusFilter === f.k;
              return (
                <button
                  key={f.k}
                  onClick={() => {
                    setStatusFilter(f.k);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-wine text-gold-light shadow-sm"
                      : "text-wine-deep/70 hover:text-wine hover:bg-gold-light/30"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Duration Filter Dropdown / Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/60 border border-gold/30 rounded-xl text-xs">
            <Timer size={14} className="text-gold-dark mr-1" />
            {durationFilters.map((df) => {
              const active = durationFilter === df.k;
              return (
                <button
                  key={df.k}
                  onClick={() => {
                    setDurationFilter(df.k);
                    setPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? "bg-gold-dark text-white shadow-xs"
                      : "text-wine-deep/70 hover:bg-gold-light/30"
                  }`}
                >
                  {df.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 font-medium text-amber-800 border border-amber-200/60">
            <Clock size={12} />
            معلّق: {stats.pending.toLocaleString("ar-EG")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-medium text-blue-800 border border-blue-200/60">
            <Check size={12} />
            مقبول: {stats.accepted.toLocaleString("ar-EG")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800 border border-emerald-200/60">
            <CheckCircle2 size={12} />
            مكتمل: {stats.completed.toLocaleString("ar-EG")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 font-medium text-red-700 border border-red-200/60">
            <XCircle size={12} />
            ملغي: {stats.cancelled.toLocaleString("ar-EG")}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

      {error ? (
        <ErrorBox msg={error} retry={retry} />
      ) : loading && !data ? (
        <LogoLoader fullscreen text="جارٍ تحميل طلبات الاستشارة..." />
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile Cards View (< md) */}
          <div className="block md:hidden divide-y divide-gold/15">
            {loading ? (
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="p-4 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              ))
            ) : consultations.length === 0 ? (
              <Empty text="مفيش طلبات استشارة مطابقة للبحث" />
            ) : (
              consultations.map((c) => {
                const isUpdating = updatingId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSel(c)}
                    className="p-4 space-y-3 transition-colors active:bg-gold-light/30 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={c.name} size={42} />
                        <div className="min-w-0">
                          <p className="font-semibold text-wine-deep text-sm truncate">{c.name}</p>
                          <p dir="ltr" className="text-right text-xs text-wine-deep/60">
                            {c.phone}
                          </p>
                          {c.email && (
                            <p dir="ltr" className="text-right text-[11px] text-wine-deep/40 truncate">
                              {c.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <ConsultationStatusBadge status={c.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-gold-light/20 p-2.5 text-xs text-wine-deep/80">
                      <div className="flex items-center gap-1.5">
                        <Hourglass size={13} className="text-gold-dark" />
                        <span>المدة: {c.duration} دقيقة</span>
                      </div>
                      {typeof c.price !== "undefined" && (
                        <div className="flex items-center gap-1.5">
                          <Coins size={13} className="text-gold-dark" />
                          <span>السعر: {c.price.toLocaleString("ar-EG")} ج.م</span>
                        </div>
                      )}
                    </div>

                    {c.topic && (
                      <p className="text-xs text-wine-deep/70 line-clamp-2 px-1">
                        الموضوع: {c.topic}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gold/15 text-xs">
                      <span className="flex items-center gap-1 text-[11px] text-wine-deep/50">
                        <Calendar size={12} />
                        {fmtDate(c.createdAt)}
                      </span>

                      {/* Quick Action Buttons */}
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.status !== "ACCEPTED" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(c, "ACCEPTED")}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                            title="قبول الاستشارة"
                          >
                            {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            قبول
                          </button>
                        )}
                        {c.status !== "COMPLETED" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(c, "COMPLETED")}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            title="إكمال الاستشارة"
                          >
                            {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            إكمال
                          </button>
                        )}
                        {c.status !== "CANCELLED" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(c, "CANCELLED")}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="إلغاء الاستشارة"
                          >
                            {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                            إلغاء
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label="حذف الاستشارة"
                          onClick={() => {
                            setDeleteError("");
                            setConsultationToDelete(c);
                          }}
                          className="rounded-lg p-1.5 text-wine-deep/40 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gold-light/40 text-wine-deep/70">
                <tr>
                  {["العميل", "الهاتف", "المدة", "السعر", "تاريخ الطلب", "الحالة", "إجراءات"].map(
                    (h) => (
                      <th key={h} className="px-5 py-3.5 font-semibold text-xs">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/15">
                {loading ? (
                  [0, 1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td colSpan={7} className="p-3">
                        <Skeleton className="h-10" />
                      </td>
                    </tr>
                  ))
                ) : consultations.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <Empty text="مفيش طلبات استشارة مطابقة للبحث" />
                    </td>
                  </tr>
                ) : (
                  consultations.map((c) => {
                    const isUpdating = updatingId === c.id;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSel(c)}
                        className="group cursor-pointer transition-colors hover:bg-gold-light/30"
                      >
                        {/* Client info */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} size={36} />
                            <div className="min-w-0">
                              <p className="font-medium text-wine-deep truncate">{c.name}</p>
                              {c.email && (
                                <p dir="ltr" className="text-right text-xs text-wine-deep/50 truncate">
                                  {c.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-3.5 text-xs">
                          <a
                            href={`tel:${c.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            dir="ltr"
                            className="inline-flex items-center gap-1.5 text-wine hover:text-gold-dark font-medium transition-colors"
                          >
                            <Phone size={13} className="text-gold-dark" />
                            {c.phone}
                          </a>
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-3.5 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-md bg-gold-light/40 px-2 py-0.5 font-medium text-wine-deep">
                            <Hourglass size={12} className="text-gold-dark" />
                            {c.duration} دقيقة
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-3.5 text-xs font-semibold text-wine-deep">
                          {typeof c.price !== "undefined" ? (
                            `${c.price.toLocaleString("ar-EG")} ج.م`
                          ) : (
                            <span className="text-wine-deep/40">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-xs text-wine-deep/60">
                          {fmtDate(c.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <ConsultationStatusBadge status={c.status} />
                        </td>

                        {/* Quick Actions */}
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            {/* Accept */}
                            {c.status !== "ACCEPTED" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(c, "ACCEPTED")}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                                title="قبول الاستشارة"
                              >
                                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                قبول
                              </button>
                            )}

                            {/* Complete */}
                            {c.status !== "COMPLETED" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(c, "COMPLETED")}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                title="إكمال الاستشارة"
                              >
                                {isUpdating ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={13} />
                                )}
                                إكمال
                              </button>
                            )}

                            {/* Cancel */}
                            {c.status !== "CANCELLED" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(c, "CANCELLED")}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="إلغاء الاستشارة"
                              >
                                {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                                إلغاء
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              aria-label="حذف الاستشارة"
                              title="حذف الاستشارة"
                              onClick={() => {
                                setDeleteError("");
                                setConsultationToDelete(c);
                              }}
                              className="rounded-lg p-1.5 text-wine-deep/40 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none"
                            >
                              <Trash2 size={16} />
                            </button>

                            {/* Details */}
                            <button
                              type="button"
                              aria-label="عرض التفاصيل"
                              title="عرض التفاصيل"
                              onClick={() => setSel(c)}
                              className="rounded-lg p-1.5 text-wine-deep/40 transition-colors hover:bg-gold-light/40 hover:text-wine focus:outline-none"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {data && <Pager p={data.pagination} onChange={setPage} />}
        </div>
      )}

      {/* Consultation Details Drawer */}
      <Drawer
        open={Boolean(sel)}
        onClose={() => setSel(null)}
        title="تفاصيل طلب الاستشارة"
      >
        {sel && (
          <div className="space-y-6">
            {/* Header Client Card */}
            <div className="flex items-center gap-4 border-b border-gold/20 pb-5">
              <Avatar name={sel.name} size={56} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-lg font-semibold text-wine-deep">{sel.name}</h3>
                  <ConsultationStatusBadge status={sel.status} />
                </div>
                {sel.email && (
                  <p dir="ltr" className="truncate text-right text-xs text-wine-deep/60">
                    {sel.email}
                  </p>
                )}
                <p className="mt-1 text-xs text-wine-deep/50">
                  تاريخ الطلب: {fmtDate(sel.createdAt)}
                </p>
              </div>
            </div>

            {/* Quick Status Switcher */}
            <div className="card p-4 space-y-2 bg-ivory/50">
              <p className="text-xs font-semibold text-wine-deep">تغيير حالة الاستشارة:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  disabled={updatingId === sel.id}
                  onClick={() => handleStatusChange(sel, "PENDING")}
                  className={`rounded-xl py-2 px-3 text-xs font-medium border transition-all ${
                    sel.status === "PENDING"
                      ? "bg-amber-100 text-amber-900 border-amber-300 shadow-sm"
                      : "bg-white text-wine-deep/70 border-gold/30 hover:bg-amber-50"
                  }`}
                >
                  معلّق
                </button>
                <button
                  type="button"
                  disabled={updatingId === sel.id}
                  onClick={() => handleStatusChange(sel, "ACCEPTED")}
                  className={`rounded-xl py-2 px-3 text-xs font-medium border transition-all ${
                    sel.status === "ACCEPTED"
                      ? "bg-blue-100 text-blue-900 border-blue-300 shadow-sm"
                      : "bg-white text-wine-deep/70 border-gold/30 hover:bg-blue-50"
                  }`}
                >
                  مقبول
                </button>
                <button
                  type="button"
                  disabled={updatingId === sel.id}
                  onClick={() => handleStatusChange(sel, "COMPLETED")}
                  className={`rounded-xl py-2 px-3 text-xs font-medium border transition-all ${
                    sel.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm"
                      : "bg-white text-wine-deep/70 border-gold/30 hover:bg-emerald-50"
                  }`}
                >
                  مكتمل
                </button>
                <button
                  type="button"
                  disabled={updatingId === sel.id}
                  onClick={() => handleStatusChange(sel, "CANCELLED")}
                  className={`rounded-xl py-2 px-3 text-xs font-medium border transition-all ${
                    sel.status === "CANCELLED"
                      ? "bg-red-100 text-red-900 border-red-300 shadow-sm"
                      : "bg-white text-wine-deep/70 border-gold/30 hover:bg-red-50"
                  }`}
                >
                  ملغي
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gold-dark">بيانات التواصل</h4>
              <div className="grid gap-2.5">
                <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-gold/25">
                  <span className="flex items-center gap-2 text-xs text-wine-deep/70">
                    <Phone size={15} className="text-gold-dark" />
                    رقم الهاتف
                  </span>
                  <a
                    href={`tel:${sel.phone}`}
                    dir="ltr"
                    className="text-xs font-semibold text-wine hover:underline"
                  >
                    {sel.phone}
                  </a>
                </div>

                {sel.email && (
                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-gold/25">
                    <span className="flex items-center gap-2 text-xs text-wine-deep/70">
                      <Mail size={15} className="text-gold-dark" />
                      البريد الإلكتروني
                    </span>
                    <a
                      href={`mailto:${sel.email}`}
                      dir="ltr"
                      className="text-xs font-semibold text-wine hover:underline truncate max-w-[200px]"
                    >
                      {sel.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Consultation Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gold-dark">تفاصيل الاستشارة</h4>
              <div className="card p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-wine-deep/50 block">المدة المطلوبة</span>
                    <p className="text-sm font-semibold text-wine-deep mt-0.5">
                      {sel.duration} دقيقة
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-wine-deep/50 block">سعر الاستشارة</span>
                    <p className="text-sm font-semibold text-wine-deep mt-0.5">
                      {typeof sel.price !== "undefined"
                        ? `${sel.price.toLocaleString("ar-EG")} ج.م`
                        : "غير محدد"}
                    </p>
                  </div>
                </div>

                {sel.topic && (
                  <div className="border-t border-gold/15 pt-2">
                    <span className="text-[11px] text-wine-deep/50 block">موضوع الاستشارة</span>
                    <p className="text-xs text-wine-deep/80 leading-5 mt-1 whitespace-pre-wrap">
                      {sel.topic}
                    </p>
                  </div>
                )}

                {sel.notes && (
                  <div className="border-t border-gold/15 pt-2">
                    <span className="text-[11px] text-wine-deep/50 block">ملاحظات العميل</span>
                    <p className="text-xs text-wine-deep/80 leading-5 mt-1 whitespace-pre-wrap">
                      {sel.notes}
                    </p>
                  </div>
                )}

                {sel.user && (
                  <div className="border-t border-gold/15 pt-2">
                    <span className="text-[11px] text-wine-deep/50 block">حساب المستخدم المرتبط</span>
                    <p className="text-xs font-medium text-wine-deep mt-0.5">
                      {sel.user.name} ({sel.user.email})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Delete */}
            <div className="pt-4 border-t border-gold/20 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteError("");
                  setConsultationToDelete(sel);
                }}
                className="btn-ghost !border-red-200 !text-red-700 hover:!bg-red-50 text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Trash2 size={15} />
                حذف طلب الاستشارة
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      {consultationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gold/30">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-red-100 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-wine-deep text-base">تأكيد حذف طلب الاستشارة</h3>
                <p className="text-xs text-wine-deep/60">هذا الإجراء نهائي ولا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="text-sm text-wine-deep/80 leading-6 mb-4">
              هل أنت متأكد من حذف طلب الاستشارة الخاص بـ{" "}
              <strong className="text-wine-deep font-semibold">
                "{consultationToDelete.name}"
              </strong>
              ؟
            </p>

            {deleteError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gold/15">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConsultationToDelete(null)}
                className="btn-ghost !text-xs !py-2 !px-4"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="btn !bg-red-600 !text-white hover:!bg-red-700 !text-xs !py-2 !px-4 shadow-sm"
              >
                {deleting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" />
                    جارٍ الحذف...
                  </span>
                ) : (
                  "نعم، احذف طلب الاستشارة"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
