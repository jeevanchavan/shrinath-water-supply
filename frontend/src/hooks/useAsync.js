import { useState, useEffect, useCallback } from "react";

export function useAsync(asyncFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // run() is exposed so callers can manually reload (e.g. after a mutation)
  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await asyncFn();
      setData(res.data?.data ?? res.data);
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let cancelled = false;

    const runSafe = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await asyncFn();
        if (!cancelled) setData(res.data?.data ?? res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    runSafe();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { data, loading, error, reload: run };
}