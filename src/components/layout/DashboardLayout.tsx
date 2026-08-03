import { useState, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const PAGE_TITLES: Record<string, string> = {
  "/": "首頁 Dashboard",
  "/jobs": "列印作品管理",
  "/filaments": "耗材管理",
  "/cost": "成本計算",
  "/customers": "客戶管理",
  "/orders": "訂單管理",
  "/showcase": "作品展示",
  "/failures": "列印失敗資料庫",
  "/assistant": "AI 助手",
  "/analytics": "數據分析",
  "/notifications": "通知",
  "/equipment": "設備管理",
};

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout(_props: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? "PrintOS";

  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar />

      {/* 行動版側邊選單 */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-40 w-72 bg-surface-light dark:bg-surface-dark lg:hidden shadow-xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <div className="flex justify-end p-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="關閉選單"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <Sidebar variant="mobile" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
