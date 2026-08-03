import { useMemo } from "react";
import type { PrintJob } from "@/types";

function ymd(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useDashboardCharts(jobs: PrintJob[]) {
  return useMemo(() => {
    // 每日列印量（近 14 天）
    const days: { label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = ymd(d);
      const count = jobs.filter(
        (j) => j.printDate && ymd(j.printDate.toDate()) === key
      ).length;
      days.push({
        label: d.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" }),
        count,
      });
    }

    // 每月收入（近 6 個月）
    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const revenue = jobs
        .filter((j) => {
          if (!j.printDate) return false;
          const jd = j.printDate.toDate();
          return jd.getFullYear() === y && jd.getMonth() === m;
        })
        .reduce((sum, j) => sum + (j.revenue || 0), 0);
      months.push({
        label: d.toLocaleDateString("zh-TW", { month: "short" }),
        revenue,
      });
    }

    // 耗材使用分析（依材料類型加總克數）
    const materialMap = new Map<string, number>();
    jobs.forEach((j) => {
      if (!j.materialGrams) return;
      const key = j.material || "未分類";
      materialMap.set(key, (materialMap.get(key) ?? 0) + j.materialGrams);
    });
    const materials = Array.from(materialMap.entries()).map(([label, grams]) => ({
      label,
      grams,
    }));

    return { days, months, materials };
  }, [jobs]);
}
