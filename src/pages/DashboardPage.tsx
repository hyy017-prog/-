import "@/utils/chartSetup";
import { useNavigate } from "react-router-dom";
import type { ElementType } from "react";
import { motion } from "framer-motion";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  PlusIcon,
  CubeIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/jobs/StatusBadge";
import { usePrintJobStats } from "@/hooks/usePrintJobStats";
import { useDashboardCharts } from "@/hooks/useDashboardCharts";
import { useFilaments } from "@/hooks/useFilaments";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency } from "@/utils/format";

interface StatCardProps {
  label: string;
  value: string;
  icon: ElementType;
  delay: number;
}

function StatCard({ label, value, icon: Icon, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      <Card className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-ink-500 mb-0.5">{label}</p>
          <p className="text-xl font-display font-bold truncate">{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}

const MATERIAL_COLORS = ["#0fa374", "#31bd8b", "#63d6a9", "#9de9c9", "#08825c", "#0a533e"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { stats, loading, error } = usePrintJobStats();
  const { days, months, materials } = useDashboardCharts(stats.allJobs);
  const { lowStockFilaments } = useFilaments();
  const { theme } = useTheme();

  const gridColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tickColor = theme === "dark" ? "#A6AAB2" : "#6B6F78";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold">總覽</h2>
          <p className="text-sm text-ink-500 mt-1">
            掌握你的列印產量、成功率與獲利狀況
          </p>
        </div>
        <Button onClick={() => navigate("/jobs")}>
          <PlusIcon className="h-4 w-4" />
          新增列印工作
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {lowStockFilaments.length > 0 && (
        <button
          onClick={() => navigate("/filaments")}
          className="w-full text-left rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-start gap-2 hover:bg-amber-500/15 transition-colors"
        >
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {lowStockFilaments.length} 捲耗材庫存偏低，點此查看
            </p>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="今日列印數" value={loading ? "…" : String(stats.todayCount)} icon={CubeIcon} delay={0} />
        <StatCard label="本月列印數" value={loading ? "…" : String(stats.monthCount)} icon={CubeIcon} delay={0.05} />
        <StatCard label="成功率" value={loading ? "…" : `${stats.successRate}%`} icon={CheckCircleIcon} delay={0.1} />
        <StatCard label="總利潤" value={loading ? "…" : formatCurrency(stats.totalProfit)} icon={BanknotesIcon} delay={0.15} />
        <StatCard label="總收入" value={loading ? "…" : formatCurrency(stats.totalRevenue)} icon={CurrencyDollarIcon} delay={0.2} />
        <StatCard label="總成本" value={loading ? "…" : formatCurrency(stats.totalCost)} icon={CurrencyDollarIcon} delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-4">每日列印量（近 14 天）</h3>
          <div className="h-56">
            <Line
              data={{
                labels: days.map((d) => d.label),
                datasets: [
                  {
                    label: "列印數",
                    data: days.map((d) => d.count),
                    borderColor: "#0fa374",
                    backgroundColor: "rgba(15,163,116,0.15)",
                    fill: true,
                    tension: 0.35,
                    pointRadius: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
                  y: { grid: { color: gridColor }, ticks: { color: tickColor, precision: 0 } },
                },
              }}
            />
          </div>
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-4">每月收入（近 6 個月）</h3>
          <div className="h-56">
            <Bar
              data={{
                labels: months.map((m) => m.label),
                datasets: [
                  {
                    label: "收入",
                    data: months.map((m) => m.revenue),
                    backgroundColor: "#0fa374",
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: tickColor } },
                  y: { grid: { color: gridColor }, ticks: { color: tickColor } },
                },
              }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <h3 className="font-display font-semibold mb-4">耗材使用分析</h3>
          {materials.length === 0 ? (
            <p className="text-sm text-ink-500 py-8 text-center">尚無資料</p>
          ) : (
            <div className="h-56">
              <Doughnut
                data={{
                  labels: materials.map((m) => m.label),
                  datasets: [
                    {
                      data: materials.map((m) => Math.round(m.grams)),
                      backgroundColor: MATERIAL_COLORS,
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { color: tickColor, boxWidth: 10, font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold mb-1">最近列印</h3>
          <p className="text-sm text-ink-500 mb-4">最新的 5 筆列印紀錄</p>

          {!loading && stats.recentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
                <CubeIcon className="h-6 w-6 text-ink-300" />
              </div>
              <p className="text-sm font-medium">還沒有任何列印紀錄</p>
              <p className="text-xs text-ink-500 mt-1 mb-4">
                新增第一筆列印工作，開始追蹤你的產量與獲利
              </p>
              <Button size="sm" onClick={() => navigate("/jobs")}>
                <PlusIcon className="h-4 w-4" />
                新增列印工作
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {stats.recentJobs.map((job) => (
                <li key={job.id} className="py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium truncate">{job.name}</span>
                  <StatusBadge status={job.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
