import { useMemo } from "react";
import type { Order, PrintJob } from "@/types";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function useAnalyticsData(jobs: PrintJob[], orders: Order[]) {
  return useMemo(() => {
    const now = new Date();

    // 近 12 個月：收入／成本／利潤／成功率趨勢
    const months: {
      key: string;
      label: string;
      revenue: number;
      cost: number;
      profit: number;
      successRate: number;
    }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const jobsInMonth = jobs.filter(
        (j) => j.printDate && monthKey(j.printDate.toDate()) === key
      );
      const revenue = jobsInMonth.reduce((s, j) => s + (j.revenue || 0), 0);
      const cost = jobsInMonth.reduce((s, j) => s + (j.totalCost || 0), 0);
      const finished = jobsInMonth.filter(
        (j) => j.status === "completed" || j.status === "failed"
      );
      const success = jobsInMonth.filter((j) => j.status === "completed").length;
      months.push({
        key,
        label: d.toLocaleDateString("zh-TW", { year: "2-digit", month: "numeric" }),
        revenue,
        cost,
        profit: revenue - cost,
        successRate: finished.length > 0 ? Math.round((success / finished.length) * 100) : 0,
      });
    }

    // 熱門產品（依作品名稱加總收入，取前 5）
    const productMap = new Map<string, number>();
    jobs.forEach((j) => {
      if (!j.name) return;
      productMap.set(j.name, (productMap.get(j.name) ?? 0) + (j.revenue || 0));
    });
    const topProducts = Array.from(productMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 耗材使用（依材料加總克數，取前 5）
    const materialMap = new Map<string, number>();
    jobs.forEach((j) => {
      if (!j.materialGrams) return;
      const key = j.material || "未分類";
      materialMap.set(key, (materialMap.get(key) ?? 0) + j.materialGrams);
    });
    const materialUsage = Array.from(materialMap.entries())
      .map(([material, grams]) => ({ material, grams }))
      .sort((a, b) => b.grams - a.grams)
      .slice(0, 5);

    // 客戶排行（依訂單金額加總，取前 5）
    const customerMap = new Map<string, number>();
    orders.forEach((o) => {
      customerMap.set(o.customerName, (customerMap.get(o.customerName) ?? 0) + o.amount);
    });
    const topCustomers = Array.from(customerMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // 本月 vs 上月
    const thisMonthKey = monthKey(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = monthKey(lastMonthDate);
    const thisMonthStats = months.find((m) => m.key === thisMonthKey) ?? {
      revenue: 0,
      cost: 0,
      profit: 0,
    };
    const lastMonthStats = months.find((m) => m.key === lastMonthKey) ?? {
      revenue: 0,
      cost: 0,
      profit: 0,
    };

    // 今年 vs 去年
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;
    const sumYear = (year: number) => {
      const yearJobs = jobs.filter(
        (j) => j.printDate && j.printDate.toDate().getFullYear() === year
      );
      const revenue = yearJobs.reduce((s, j) => s + (j.revenue || 0), 0);
      const cost = yearJobs.reduce((s, j) => s + (j.totalCost || 0), 0);
      return { revenue, cost, profit: revenue - cost, count: yearJobs.length };
    };
    const thisYearStats = sumYear(thisYear);
    const lastYearStats = sumYear(lastYear);

    return {
      months,
      topProducts,
      materialUsage,
      topCustomers,
      monthComparison: { current: thisMonthStats, previous: lastMonthStats },
      yearComparison: { current: thisYearStats, previous: lastYearStats, thisYear, lastYear },
    };
  }, [jobs, orders]);
}
