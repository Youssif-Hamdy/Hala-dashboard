import { useEffect, useState, useCallback } from "react";
import { errMsg } from "./api";

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    fn()
      .then((d) => live && setData(d))
      .catch((e) => live && setError(errMsg(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, retry };
}

export const fmtDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime())
    ? s
    : d.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

export const initials = (n?: string) => {
  if (!n) return "ح";
  return n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};
