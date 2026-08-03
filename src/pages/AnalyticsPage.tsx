import "@/utils/chartSetup";
import { Bar, Line } from "react-chartjs-2";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { usePrintJobStats } from "@/hooks/usePrintJobStats";
import { useOrders } from "@/hooks/useOrders";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useTheme } from "@/contexts/ThemeContext";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

const COLORS = ["#0fa374", "#31bd8b", "#63d6a9", "#9de9c9", "#08825c"];

function ChangeBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-ink-400">
        <MinusIcon className="h-3 w-3" />
        無資料
      </span>
    );
  }
  const diff = current - previous;
  const pct = previous !== 0 ? Math.round((diff / Math.abs(previous)) * 100) : 100;
  const isUp = diff > 0;
  const isFlat = diff === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isFlat ? "text-ink-400" : isUp ? "text-brand-600 dark:text-brand-400" : "text-red-500"
      )}
    >
      {isFlat ? (
        <MinusIcon className="h-3 w-3" />
      ) : isUp ? (
        <ArrowUpIcon className="h-3 w-3" />
      ) : (
        <ArrowDownIcon className="h-3 w-3" />
      )}
      {isFlat ? "持平" : `${Math.abs(pct)}%`}
    </span>
  );
}

export default function AnalyticsPage() {
  const { stats } = usePrintJobStats();
  const { orders } = useOrders();
  const { months, topProducts, materialUsage, topCustomers, monthComparison, yearComparison } =
    useAnalyticsData(stats.allJobs, orders);
  const { theme } = useTheme();

  const gridColor = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tickColor = theme === "dark" ? "#A6AAB2" : "#6B6F78";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-display font-bold">數據分析</h2>
        <p className="text-sm text-ink-500 mt-1">收入、成本、利潤與經營狀況的完整分析</p>
      </div>

      {/* 月度 / 年度比較 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-4">本月 vs 上月</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-ink-500 mb-1">收入</p>
              <p className="font-semibold">{formatCurrency(monthComparison.current.revenue)}</p>
              <ChangeBadge
                current={monthComparison.current.revenue}
                previous={monthComparison.previous.revenue}
              />
            </div>
            <div>
              <p className="text-xs text-ink-500 mb-1">成本</p>
              <p className="font-semibold">{formatCurrency(monthComparison.current.cost)}</p>
              <ChangeBadge
                current={monthComparison.current.cost}
                previous={monthComparison.previous.cost}
              />
            </div>
            <div>
              <p className="text-xs text-ink-500 mb-1">利潤</p>
              <p className="font-semibold">{formatCurrency(monthComparison.current.profit)}</p>
              <ChangeBadge
                current={monthComparison.current.profit}
                previous={monthComparison.previous.profit}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-4">
            {yearComparison.thisYear} vs {yearComparison.lastYear}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-ink-500 mb-1">收入</p>
              <p className="font-semibold">{formatCurrency(yearComparison.current.revenue)}</p>
              <ChangeBadge
                current={yearComparison.current.revenue}
                previous={yearComparison.previous.revenue}
              />
            </div>
            <div>
              <p className="text-xs text-ink-500 mb-1">利潤</p>
              <p className="font-semibold">{formatCurrency(yearComparison.current.profit)}</p>
              <ChangeBadge
                current={yearComparison.current.profit}
                previous={yearComparison.previous.profit}
              />
            </div>
            <div>
              <p className="text-xs text-ink-500 mb-1">列印數</p>
              <p className="font-semibold">{yearComparison.current.count} 筆</p>
              <ChangeBadge
                current={yearComparison.current.count}
                previous={yearComparison.previous.count}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 收入/成本/利潤趨勢 */}
      <Card>
        <h3 className="font-display font-semibold mb-4">收入／成本／利潤趨勢（近 12 個月）</h3>
        <div className="h-64">
          <Line
            data={{
              labels: months.map((m) => m.label),
              datasets: [
                {
                  label: "收入",
                  data: months.map((m) => m.revenue),
                  borderColor: "#0fa374",
                  backgroundColor: "rgba(15,163,116,0.1)",
                  tension: 0.35,
                },
                {
                  label: "成本",
                  data: months.map((m) => m.cost),
                  borderColor: "#ef4444",
                  backgroundColor: "rgba(239,68,68,0.1)",
                  tension: 0.35,
                },
                {
                  label: "利潤",
                  data: months.map((m) => m.profit),
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(59,130,246,0.1)",
                  tension: 0.35,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom", labels: { color: tickColor } } },
              scales: {
                x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
                y: { grid: { color: gridColor }, ticks: { color: tickColor } },
              },
            }}
          />
        </div>
      </Card>

      {/* 成功率趨勢 */}
      <Card>
        <h3 className="font-display font-semibold mb-4">列印成功率趨勢（近 12 個月）</h3>
        <div className="h-56">
          <Line
            data={{
              labels: months.map((m) => m.label),
              datasets: [
                {
                  label: "成功率 (%)",
                  data: months.map((m) => m.successRate),
                  borderColor: "#0fa374",
                  backgroundColor: "rgba(15,163,116,0.15)",
                  fill: true,
                  tension: 0.35,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
                y: {
                  min: 0,
                  max: 100,
                  grid: { color: gridColor },
                  ticks: { color: tickColor, callback: (v) => `${v}%` },
                },
              },
            }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-4">熱門產品（依收入）</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-ink-500 py-8 text-center">尚無資料</p>
          ) : (
            <div className="h-52">
              <Bar
                data={{
                  labels: topProducts.map((p) => p.name),
                  datasets: [
                    {
                      data: topProducts.map((p) => p.revenue),
                      backgroundColor: COLORS,
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: gridColor }, ticks: { color: tickColor } },
                    y: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 } } },
                  },
                }}
              />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-4">耗材使用（依克數）</h3>
          {materialUsage.length === 0 ? (
            <p className="text-sm text-ink-500 py-8 text-center">尚無資料</p>
          ) : (
            <div className="h-52">
              <Bar
                data={{
                  labels: materialUsage.map((m) => m.material),
                  datasets: [
                    {
                      data: materialUsage.map((m) => Math.round(m.grams)),
                      backgroundColor: COLORS,
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: gridColor }, ticks: { color: tickColor } },
                    y: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 } } },
                  },
                }}
              />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-4">客戶排行（依消費）</h3>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-ink-500 py-8 text-center">尚無資料</p>
          ) : (
            <div className="h-52">
              <Bar
                data={{
                  labels: topCustomers.map((c) => c.name),
                  datasets: [
                    {
                      data: topCustomers.map((c) => c.total),
                      backgroundColor: COLORS,
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { color: gridColor }, ticks: { color: tickColor } },
                    y: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 } } },
                  },
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
