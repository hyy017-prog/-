import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToPrintJobs } from "@/services/printJobService";
import type { PrintJob } from "@/types";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function usePrintJobStats() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToPrintJobs(
      user.uid,
      (data) => {
        setJobs(data);
        setLoading(false);
        setError(null);
      },
      (message) => {
        setError(message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayJobs = jobs.filter(
      (j) => j.printDate && isSameDay(j.printDate.toDate(), now)
    );
    const monthJobs = jobs.filter(
      (j) => j.printDate && isSameMonth(j.printDate.toDate(), now)
    );
    const finishedJobs = jobs.filter(
      (j) => j.status === "completed" || j.status === "failed"
    );
    const successCount = jobs.filter((j) => j.status === "completed").length;
    const successRate =
      finishedJobs.length > 0
        ? Math.round((successCount / finishedJobs.length) * 100)
        : 0;

    const totalRevenue = jobs.reduce((sum, j) => sum + (j.revenue || 0), 0);
    const totalCost = jobs.reduce((sum, j) => sum + (j.totalCost || 0), 0);

    return {
      todayCount: todayJobs.length,
      monthCount: monthJobs.length,
      successRate,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
      recentJobs: jobs.slice(0, 5),
      allJobs: jobs,
    };
  }, [jobs]);

  return { stats, loading, error };
}
