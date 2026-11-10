import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { deleteBooking, errMsg, getBookings, updateBookingStatus } from "../lib/api";
import { fmtDate, useFetch } from "../lib/hooks";
import type { Booking, BookingStatus } from "../types";
import Drawer from "../components/Drawer";
import {
  Avatar,
  BookingStatusBadge,
  Empty,
  ErrorBox,
  LogoLoader,
  PageHead,
  Pager,
  Skeleton,
} from "../components/ui";

const filters: { k: BookingStatus | ""; label: string }[] = [
  { k: "", label: "الكل" },
  { k: "PENDING", label: "معلّق" },
  { k: "ACCEPTED", label: "مقبول" },
  { k: "REJECTED", label: "مرفوض" },
];

export default function Bookings() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Booking | null>(null);

  // Status updating state: map of bookingId -> boolean
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Delete state
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { data, loading, error, retry } = useFetch(
    () => getBookings(page, 10, statusFilter || undefined),
    [page, statusFilter]
  );

  const bookings = data?.data ?? [];

  // Local search filter
  const rows = bookings.filter((b) => {
    const name = b.name || b.fullName || b.user?.name || "";
    const email = b.email || b.user?.email || "";
    const phone = b.phone || b.phoneNumber || b.user?.phone || "";
    const note = b.notes || b.message || b.service || b.course || "";
    const query = q.trim().toLowerCase();
    return (name + " " + email + " " + phone + " " + note)
      .toLowerCase()
      .includes(query);
  });

  // Calculate quick stats from current page
  const stats = {
    pending: bookings.filter((b) => b.status === "PENDING").length,
    accepted: bookings.filter((b) => b.status === "ACCEPTED").length,
    rejected: bookings.filter((b) => b.status === "REJECTED").length,
  };

  // Handle status update
  const handleStatusChange = async (b: Booking, newStatus: BookingStatus) => {
    if (b.status === newStatus || updatingId) return;
    try {
      setUpdatingId(b.id);
      setActionError("");
      await updateBookingStatus(b.id, newStatus);
      // Update drawer selection if open
      if (sel?.id === b.id) {
        setSel({ ...sel, status: newStatus });
      }
      retry();
    } catch (err) {
      setActionError(errMsg(err));
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle delete
  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    try {
      setDeleting(true);
      setDeleteError("");
      await deleteBooking(bookingToDelete.id);
      if (sel?.id === bookingToDelete.id) {
        setSel(null);
      }
      setBookingToDelete(null);
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
        title="إدارة الحجوزات"
        sub={`${(data?.pagination.total ?? 0).toLocaleString("ar-EG")} طلب حجز إجمالي`}
      >
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-dark"
          />
          <input
            className="input pr-11"
            placeholder="ابحث بالاسم، الهاتف، أو الخدمة..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </PageHead>

      {/* Top Banner: Quick Stats & Filter Chips */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex gap-1.5 p-1 bg-white/60 border border-gold/30 rounded-xl w-fit">
          {filters.map((f) => {
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

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 font-medium text-amber-800 border border-amber-200/60">
            <Clock size={12} />
            معلّق: {stats.pending.toLocaleString("ar-EG")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800 border border-emerald-200/60">
            <CheckCircle2 size={12} />
            مقبول: {stats.accepted.toLocaleString("ar-EG")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 font-medium text-red-700 border border-red-200/60">
            <XCircle size={12} />
            مرفوض: {stats.rejected.toLocaleString("ar-EG")}
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
        <LogoLoader fullscreen text="جارٍ تحميل طلبات الحجز..." />
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
            ) : rows.length === 0 ? (
              <Empty text="مفيش طلبات حجز مطابقة للبحث" />
            ) : (
              rows.map((b) => {
                const name = b.name || b.fullName || b.user?.name || "بدون اسم";
                const phone = b.phone || b.phoneNumber || b.user?.phone;
                const email = b.email || b.user?.email;
                const service = b.service || b.course || "حجز عام";
                const date = b.date || b.bookingDate || b.createdAt;
                const isUpdating = updatingId === b.id;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSel(b)}
                    className="p-4 space-y-3 transition-colors active:bg-gold-light/30 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={name} size={42} />
                        <div className="min-w-0">
                          <p className="font-semibold text-wine-deep text-sm truncate">{name}</p>
                          {phone && (
                            <p dir="ltr" className="text-right text-xs text-wine-deep/60">
                              {phone}
                            </p>
                          )}
                          {email && (
                            <p dir="ltr" className="text-right text-[11px] text-wine-deep/40 truncate">
                              {email}
                            </p>
                          )}
                        </div>
                      </div>

                      <BookingStatusBadge status={b.status} />
                    </div>

                    <div className="rounded-xl bg-gold-light/20 p-2.5 text-xs text-wine-deep/80 space-y-1">
                      <p className="font-medium text-wine">
                        الخدمة: <span className="font-normal text-wine-deep">{service}</span>
                      </p>
                      {b.notes && (
                        <p className="line-clamp-2 text-wine-deep/60 text-[11px]">
                          {b.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gold/15 text-xs">
                      <span className="flex items-center gap-1 text-[11px] text-wine-deep/50">
                        <Calendar size={12} />
                        {fmtDate(date)}
                      </span>

                      {/* Quick Action Buttons */}
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {b.status !== "ACCEPTED" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(b, "ACCEPTED")}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            title="قبول الحجز"
                          >
                            {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            قبول
                          </button>
                        )}
                        {b.status !== "REJECTED" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(b, "REJECTED")}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="رفض الحجز"
                          >
                            {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                            رفض
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label="حذف الحجز"
                          onClick={() => {
                            setDeleteError("");
                            setBookingToDelete(b);
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
                  {["العميل", "الهاتف", "الخدمة / التفاصيل", "تاريخ الحجز", "الحالة", "إجراءات"].map(
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
                      <td colSpan={6} className="p-3">
                        <Skeleton className="h-10" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <Empty text="مفيش طلبات حجز مطابقة للبحث" />
                    </td>
                  </tr>
                ) : (
                  rows.map((b) => {
                    const name = b.name || b.fullName || b.user?.name || "بدون اسم";
                    const phone = b.phone || b.phoneNumber || b.user?.phone;
                    const email = b.email || b.user?.email;
                    const service = b.service || b.course || "حجز عام";
                    const date = b.date || b.bookingDate || b.createdAt;
                    const isUpdating = updatingId === b.id;

                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSel(b)}
                        className="group cursor-pointer transition-colors hover:bg-gold-light/30"
                      >
                        {/* Client info */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={name} size={36} />
                            <div className="min-w-0">
                              <p className="font-medium text-wine-deep truncate">{name}</p>
                              {email && (
                                <p dir="ltr" className="text-right text-xs text-wine-deep/50 truncate">
                                  {email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-3.5 text-xs">
                          {phone ? (
                            <a
                              href={`tel:${phone}`}
                              onClick={(e) => e.stopPropagation()}
                              dir="ltr"
                              className="inline-flex items-center gap-1.5 text-wine hover:text-gold-dark font-medium transition-colors"
                            >
                              <Phone size={13} className="text-gold-dark" />
                              {phone}
                            </a>
                          ) : (
                            <span className="text-wine-deep/40">—</span>
                          )}
                        </td>

                        {/* Service / Details */}
                        <td className="px-5 py-3.5 text-xs">
                          <p className="font-medium text-wine-deep truncate max-w-[200px]">
                            {service}
                          </p>
                          {b.notes && (
                            <p className="text-[11px] text-wine-deep/50 truncate max-w-[200px]">
                              {b.notes}
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-xs text-wine-deep/60">
                          {fmtDate(date)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <BookingStatusBadge status={b.status} />
                        </td>

                        {/* Quick Actions */}
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            {/* Accept button */}
                            {b.status !== "ACCEPTED" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(b, "ACCEPTED")}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                title="قبول الحجز"
                              >
                                {isUpdating ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Check size={13} />
                                )}
                                قبول
                              </button>
                            )}

                            {/* Reject button */}
                            {b.status !== "REJECTED" && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(b, "REJECTED")}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="رفض الحجز"
                              >
                                {isUpdating ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <X size={13} />
                                )}
                                رفض
                              </button>
                            )}

                            {/* Delete button */}
                            <button
                              type="button"
                              aria-label="حذف الحجز"
                              title="حذف الحجز"
                              onClick={() => {
                                setDeleteError("");
                                setBookingToDelete(b);
                              }}
                              className="rounded-lg p-1.5 text-wine-deep/40 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none"
                            >
                              <Trash2 size={16} />
                            </button>

                            {/* View details */}
                            <button
                              type="button"
                              aria-label="عرض التفاصيل"
                              title="عرض التفاصيل"
                              onClick={() => setSel(b)}
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

      {/* Booking Details Drawer */}
      <Drawer
        open={Boolean(sel)}
        onClose={() => setSel(null)}
        title="تفاصيل طلب الحجز"
      >
        {sel && (
          <div className="space-y-6">
            {/* Header Client Card */}
            <div className="flex items-center gap-4 border-b border-gold/20 pb-5">
              <Avatar
                name={sel.name || sel.fullName || sel.user?.name || "بدون اسم"}
                size={56}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-lg font-semibold text-wine-deep">
                    {sel.name || sel.fullName || sel.user?.name || "بدون اسم"}
                  </h3>
                  <BookingStatusBadge status={sel.status} />
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

            {/* Quick Status Toggle */}
            <div className="card p-4 space-y-2 bg-ivory/50">
              <p className="text-xs font-semibold text-wine-deep">تغيير حالة الحجز:</p>
              <div className="grid grid-cols-3 gap-2">
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
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm"
                      : "bg-white text-wine-deep/70 border-gold/30 hover:bg-emerald-50"
                  }`}
                >
                  مقبول
                </button>
                <button
                  type="button"
                  disabled={updatingId === sel.id}
                  onClick={() => handleStatusChange(sel, "REJECTED")}
                  className={`rounded-xl py-2 px-3 text-xs font-medium border transition-all ${
                    sel.status === "REJECTED"
                      ? "bg-red-100 text-red-900 border-red-300 shadow-sm"
                      : "bg-white text-wine-deep/70 border-gold/30 hover:bg-red-50"
                  }`}
                >
                  مرفوض
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gold-dark">بيانات التواصل</h4>
              <div className="grid gap-2.5">
                {(sel.phone || sel.phoneNumber || sel.user?.phone) && (
                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-gold/25">
                    <span className="flex items-center gap-2 text-xs text-wine-deep/70">
                      <Phone size={15} className="text-gold-dark" />
                      رقم الهاتف
                    </span>
                    <a
                      href={`tel:${sel.phone || sel.phoneNumber || sel.user?.phone}`}
                      dir="ltr"
                      className="text-xs font-semibold text-wine hover:underline"
                    >
                      {sel.phone || sel.phoneNumber || sel.user?.phone}
                    </a>
                  </div>
                )}

                {(sel.email || sel.user?.email) && (
                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-gold/25">
                    <span className="flex items-center gap-2 text-xs text-wine-deep/70">
                      <Mail size={15} className="text-gold-dark" />
                      البريد الإلكتروني
                    </span>
                    <a
                      href={`mailto:${sel.email || sel.user?.email}`}
                      dir="ltr"
                      className="text-xs font-semibold text-wine hover:underline truncate max-w-[200px]"
                    >
                      {sel.email || sel.user?.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gold-dark">تفاصيل الحجز</h4>
              <div className="card p-4 space-y-3">
                <div>
                  <span className="text-[11px] text-wine-deep/50 block">الخدمة أو الكورس</span>
                  <p className="text-sm font-semibold text-wine-deep mt-0.5">
                    {sel.service || sel.course || "حجز عام"}
                  </p>
                </div>

                {(sel.date || sel.bookingDate) && (
                  <div className="border-t border-gold/15 pt-2">
                    <span className="text-[11px] text-wine-deep/50 block">الموعد المحدد</span>
                    <p className="text-xs font-medium text-wine-deep mt-0.5">
                      {fmtDate(sel.date || sel.bookingDate)} {sel.time ? `— ${sel.time}` : ""}
                    </p>
                  </div>
                )}

                {(sel.notes || sel.message) && (
                  <div className="border-t border-gold/15 pt-2">
                    <span className="text-[11px] text-wine-deep/50 block">ملاحظات العميل</span>
                    <p className="text-xs text-wine-deep/80 leading-5 mt-1 whitespace-pre-wrap">
                      {sel.notes || sel.message}
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
                  setBookingToDelete(sel);
                }}
                className="btn-ghost !border-red-200 !text-red-700 hover:!bg-red-50 text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Trash2 size={15} />
                حذف طلب الحجز
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      {bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gold/30">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-red-100 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-wine-deep text-base">تأكيد حذف طلب الحجز</h3>
                <p className="text-xs text-wine-deep/60">هذا الإجراء نهائي ولا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="text-sm text-wine-deep/80 leading-6 mb-4">
              هل أنت متأكد من حذف طلب الحجز الخاص بـ{" "}
              <strong className="text-wine-deep font-semibold">
                "{bookingToDelete.name || bookingToDelete.fullName || bookingToDelete.user?.name || "العميل"}"
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
                onClick={() => setBookingToDelete(null)}
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
                  "نعم، احذف طلب الحجز"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
