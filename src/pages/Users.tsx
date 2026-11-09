import { Loader2, Search, Trash2, UserCheck, AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";
import { deleteUser, errMsg, getUsers } from "../lib/api";
import { useAuth } from "../lib/auth";
import { fmtDate, useFetch } from "../lib/hooks";
import type { Role, UserRow } from "../types";
import Drawer from "../components/Drawer";
import UserDetail from "../components/UserDetail";
import {
  Avatar,
  Empty,
  ErrorBox,
  PageHead,
  Pager,
  RoleBadge,
  Skeleton,
} from "../components/ui";

const filters: { k: Role | ""; label: string }[] = [
  { k: "", label: "الكل" },
  { k: "USER", label: "المستخدمين" },
  { k: "ADMIN", label: "الأدمن" },
];

export default function Users() {
  const { user: currentAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<Role | "">("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  // Delete state
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { data, loading, error, retry } = useFetch(
    () => getUsers(page, 10, role || undefined),
    [page, role]
  );

  const rows = (data?.data ?? []).filter((r) =>
    (r.name + " " + r.email).toLowerCase().includes(q.trim().toLowerCase())
  );

  const confirmDeleteAction = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      setDeleteError("");
      await deleteUser(userToDelete.id);
      if (sel === userToDelete.id) {
        setSel(null);
      }
      setUserToDelete(null);
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
        title="المستخدمين"
        sub={`${(data?.pagination.total ?? 0).toLocaleString("ar-EG")} مستخدم مسجّل`}
      >
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-dark"
          />
          <input
            className="input pr-11"
            placeholder="ابحث بالاسم أو الإيميل..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </PageHead>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1.5 p-1 bg-white/60 border border-gold/30 rounded-xl w-fit">
        {filters.map((f) => {
          const active = role === f.k;
          return (
            <button
              key={f.k}
              onClick={() => {
                setRole(f.k);
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

      {error ? (
        <ErrorBox msg={error} retry={retry} />
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
              <Empty text="مفيش مستخدمين مطابقين للبحث" />
            ) : (
              rows.map((r) => {
                const isSelf = currentAdmin?.email === r.email;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSel(r.id)}
                    className="p-4 space-y-3 transition-colors active:bg-gold-light/30 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={r.name} size={42} />
                        <div className="min-w-0">
                          <p className="font-semibold text-wine-deep text-sm truncate">
                            {r.name}
                          </p>
                          <p dir="ltr" className="text-right text-xs text-wine-deep/50 truncate">
                            {r.email}
                          </p>
                        </div>
                      </div>

                      {!isSelf && (
                        <button
                          type="button"
                          aria-label="حذف المستخدم"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteError("");
                            setUserToDelete(r);
                          }}
                          className="rounded-lg p-2 text-wine-deep/40 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gold/15 text-xs">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={r.role} />
                        {r.application ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                            <UserCheck size={12} />
                            قدّم استمارة
                          </span>
                        ) : (
                          <span className="rounded-full bg-gold-light/50 px-2 py-0.5 text-[11px] text-wine-deep/50">
                            لم يقدّم
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1 text-[11px] text-wine-deep/50">
                        <Calendar size={12} />
                        {fmtDate(r.createdAt)}
                      </span>
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
                  {["المستخدم", "الصلاحية", "تاريخ التسجيل", "الاستمارة", "إجراءات"].map((h) => (
                    <th key={h} className="px-5 py-3.5 font-semibold text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/15">
                {loading ? (
                  [0, 1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="p-3">
                        <Skeleton className="h-10" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <Empty text="مفيش مستخدمين مطابقين للبحث" />
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const isSelf = currentAdmin?.email === r.email;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSel(r.id)}
                        className="group cursor-pointer transition-colors hover:bg-gold-light/30"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={r.name} size={36} />
                            <div className="min-w-0">
                              <p className="font-medium text-wine-deep">{r.name}</p>
                              <p dir="ltr" className="text-right text-xs text-wine-deep/50">
                                {r.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <RoleBadge role={r.role} />
                        </td>
                        <td className="px-5 py-3.5 text-xs text-wine-deep/60">
                          {fmtDate(r.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          {r.application ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                              <UserCheck size={12} />
                              قدّم
                            </span>
                          ) : (
                            <span className="rounded-full bg-gold-light/50 px-2.5 py-0.5 text-xs text-wine-deep/50">
                              لم يقدّم
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {!isSelf && (
                            <button
                              type="button"
                              aria-label="حذف المستخدم"
                              title="حذف المستخدم"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteError("");
                                setUserToDelete(r);
                              }}
                              className="rounded-lg p-1.5 text-wine-deep/40 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
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

      {/* User Details Drawer */}
      <Drawer
        open={Boolean(sel)}
        onClose={() => setSel(null)}
        title="تفاصيل المستخدم"
      >
        {sel && (
          <UserDetail
            id={sel}
            onDeleted={() => {
              setSel(null);
              retry();
            }}
          />
        )}
      </Drawer>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gold/30">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-red-100 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-wine-deep text-base">تأكيد حذف المستخدم</h3>
                <p className="text-xs text-wine-deep/60">هذا الإجراء نهائي ولا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="text-sm text-wine-deep/80 leading-6 mb-4">
              هل أنت متأكد من حذف الحساب الخاص بـ{" "}
              <strong className="text-wine-deep font-semibold">"{userToDelete.name}"</strong> (
              <span dir="ltr" className="inline-block text-xs">{userToDelete.email}</span>)؟
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
                onClick={() => setUserToDelete(null)}
                className="btn-ghost !text-xs !py-2 !px-4"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteAction}
                className="btn !bg-red-600 !text-white hover:!bg-red-700 !text-xs !py-2 !px-4 shadow-sm"
              >
                {deleting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" />
                    جارٍ الحذف...
                  </span>
                ) : (
                  "نعم، احذف المستخدم"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
