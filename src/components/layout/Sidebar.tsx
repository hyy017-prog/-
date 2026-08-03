import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  CubeIcon,
  ArchiveBoxIcon,
  CalculatorIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChartBarIcon,
  BellIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { to: "/", label: "首頁 Dashboard", icon: HomeIcon, end: true },
  { to: "/jobs", label: "列印作品管理", icon: CubeIcon },
  { to: "/filaments", label: "耗材管理", icon: ArchiveBoxIcon },
  { to: "/cost", label: "成本計算", icon: CalculatorIcon },
  { to: "/customers", label: "客戶管理", icon: UsersIcon },
  { to: "/orders", label: "訂單管理", icon: ClipboardDocumentListIcon },
  { to: "/showcase", label: "作品展示", icon: PhotoIcon },
  { to: "/failures", label: "列印失敗資料庫", icon: ExclamationTriangleIcon },
  { to: "/assistant", label: "AI 助手", icon: SparklesIcon },
  { to: "/analytics", label: "數據分析", icon: ChartBarIcon },
  { to: "/notifications", label: "通知", icon: BellIcon },
  { to: "/equipment", label: "設備管理", icon: WrenchScrewdriverIcon },
] as const;

export function Sidebar({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  return (
    <aside
      className={cn(
        "flex flex-col w-64 shrink-0 bg-surface-light dark:bg-surface-dark",
        variant === "desktop" &&
          "hidden lg:flex border-r border-black/5 dark:border-white/5 h-screen sticky top-0"
      )}
    >
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <CubeIcon className="h-5 w-5 text-white" />
        </div>
        <span className="font-display font-bold text-lg">PrintOS</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                  : "text-ink-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-ink-900 dark:hover:text-ink-100"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
