import { useState } from "react";
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/services/authService";
import toast from "react-hot-toast";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, increase, decrease, canIncrease, canDecrease } = useFontSize();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("已登出");
    } catch {
      toast.error("登出失敗，請再試一次");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur px-4 lg:px-8 h-16">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="開啟選單"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <h1 className="font-display font-semibold text-lg truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          <button
            onClick={decrease}
            disabled={!canDecrease}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="縮小文字"
            title="縮小文字"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs font-medium text-ink-500 select-none w-10 text-center">
            {fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}
          </span>
          <button
            onClick={increase}
            disabled={!canIncrease}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="放大文字"
            title="放大文字"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="切換深色模式"
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-medium">
                {(user?.displayName ?? user?.email ?? "?")[0]?.toUpperCase()}
              </div>
            )}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 card p-2 animate-fade-in"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1">
                <p className="text-sm font-medium truncate">
                  {user?.displayName ?? "使用者"}
                </p>
                <p className="text-xs text-ink-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                登出
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
