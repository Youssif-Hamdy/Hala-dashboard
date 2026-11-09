import { useState } from "react";
import { getApplication, getApplications } from "../lib/api";
import { fmtDate, useFetch } from "../lib/hooks";
import Drawer from "../components/Drawer";
import { AppBody } from "../components/UserDetail";
import { Avatar, Empty, ErrorBox, PageHead, Pager, Skeleton } from "../components/ui";

function Detail({ id }: { id: string }) {
  const { data, loading, error, retry } = useFetch(() => getApplication(id), [id]);
  if (error) return <ErrorBox msg={error} retry={retry} />;
  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  }
  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <Avatar name={data.name} size={48} />
        <div>
          <p className="font-semibold text-wine-deep">{data.name}</p>
          <p dir="ltr" className="text-right text-xs text-wine-deep/60">
            {data.user?.email}
          </p>
          <p className="text-xs text-wine-deep/50">{fmtDate(data.createdAt)}</p>
        </div>
      </div>
      <AppBody challenges={data.currentChallenges} goal={data.courseGoal} />
    </>
  );
}

export default function Applications() {
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<string | null>(null);
  const { data, loading, error, retry } = useFetch(
    () => getApplications(page, 9),
    [page]
  );

  return (
    <>
      <PageHead
        title="الاستمارات"
        sub={`${(data?.pagination.total ?? 0).toLocaleString("ar-EG")} استمارة مقدّمة`}
      />

      {error ? (
        <ErrorBox msg={error} retry={retry} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-48" />)
            ) : data?.data.length === 0 ? (
              <div className="card col-span-full">
                <Empty text="لسه مفيش استمارات اتقدمت" />
              </div>
            ) : (
              data?.data.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSel(a.id)}
                  className="card group relative overflow-hidden p-5 text-right transition-all duration-200 hover:-translate-y-1 hover:shadow-glow focus:outline-none"
                >
                  <span className="absolute inset-x-0 top-0 h-1 origin-right scale-x-0 bg-gradient-to-l from-wine to-gold transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} size={38} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-wine-deep">{a.name}</p>
                      <p className="text-xs text-wine-deep/50">{fmtDate(a.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gold/15 pt-3">
                    <p className="text-xs font-semibold text-gold-dark">أبرز التحديات</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-wine-deep/80">
                      {a.currentChallenges || "لم يتم التحديد"}
                    </p>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs font-semibold text-gold-dark">الهدف من الكورس</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-wine-deep/80">
                      {a.courseGoal || "لم يتم التحديد"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
          {data && (
            <div className="card mt-6">
              <Pager p={data.pagination} onChange={setPage} />
            </div>
          )}
        </>
      )}

      <Drawer
        open={Boolean(sel)}
        onClose={() => setSel(null)}
        title="تفاصيل الاستمارة"
      >
        {sel && <Detail id={sel} />}
      </Drawer>
    </>
  );
}
