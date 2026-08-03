import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-light dark:bg-surface-dark px-4 text-center">
      <p className="text-6xl font-display font-bold text-brand-500">404</p>
      <h1 className="text-xl font-display font-semibold">找不到這個頁面</h1>
      <p className="text-sm text-ink-500">你要找的頁面不存在，或已經被移除了。</p>
      <Link to="/">
        <Button>回到首頁</Button>
      </Link>
    </div>
  );
}
