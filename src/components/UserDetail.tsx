import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteUser, errMsg, getUser } from "../lib/api";
import { useAuth } from "../lib/auth";
import { fmtDate, useFetch } from "../lib/hooks";
import { Avatar, ErrorBox, RoleBadge, Skeleton } from "./ui";

export const AppBody = ({ challenges, goal }: { challenges: string; goal: string }) => (
  <div className="space-y-4">
    {[["أبرز التحديات", challenges], ["الهدف من الكورس", goal]].map(([t, v]) => (
      <section key={t} className="card p-5">
        <h3 className="mb-2 text-sm font-semibold text-gold-dark">{t}</h3>
        <p className="whitespace-pre-wrap text-sm leading-8 text-wine-deep/90">{v}</p>
      </section>
    ))}
  </div>
);

export default function UserDetail({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted?: () => void;
}) {
  const { user: currentAdmin } = useAuth();
  const { data, loading, error, retry } = useFetch(() => getUser(id), [id]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState("");

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setDelError("");
      await deleteUser(id);
      onDeleted?.();
    } catch (e) {
      setDelError(errMsg(e));
      setDeleting(false);
    }
  };

  if (error) return <ErrorBox msg={error} retry={retry} />;
  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const isSelf = currentAdmin?.email === data.email;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/20 pb-5">
        <div className="flex items-center gap-4">
          <Avatar name={data.name} size={56} />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-wine-deep">{data.name}</h3>
            <p dir="ltr" className="truncate text-right text-xs text-wine-deep/60">
              {data.email}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <RoleBadge role={data.role} />
              <span className="text-xs text-wine-deep/50">
                انضم {fmtDate(data.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Delete user button */}
        {!isSelf && (
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn-ghost !border-red-200 !text-red-700 hover:!bg-red-50 text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Trash2 size={15} />
                حذف المستخدم
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 p-2 rounded-xl border border-red-200">
                <span className="text-xs font-medium text-red-700">تأكيد الحذف؟</span>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : "نعم، احذف"}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    setConfirmDelete(false);
                    setDelError("");
                  }}
                  className="rounded-lg px-2.5 py-1 text-xs text-wine-deep/70 hover:bg-white"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {delError && (
        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {delError}
        </div>
      )}

      {data.application ? (
        <>
          <p className="text-xs text-wine-deep/60 font-medium">
            قدّم الاستمارة في {fmtDate(data.application.createdAt)}
          </p>
          <AppBody
            challenges={data.application.currentChallenges}
            goal={data.application.courseGoal}
          />
        </>
      ) : (
        <div className="card p-8 text-center text-xs text-wine-deep/60">
          المستخدم ده لسه ما قدّمش استمارة.
        </div>
      )}
    </div>
  );
}
