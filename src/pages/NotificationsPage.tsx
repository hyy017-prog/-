import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  BellAlertIcon,
  CheckCircleIcon,
  CubeIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, type NotificationItem, type NotificationType } from "@/hooks/useNotifications";
import { cn } from "@/utils/cn";

const TYPE_ICON: Record<NotificationType, typeof CubeIcon> = {
  print_complete: CubeIcon,
  low_stock: ArchiveBoxIcon,
  order_unpaid: ClipboardDocumentListIcon,
  delivery_due: TruckIcon,
  maintenance_due: WrenchScrewdriverIcon,
};

const SEVERITY_STYLE = {
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function dismissedKey(uid: string) {
  return `printos-dismissed-notifications-${uid}`;
}

function loadDismissed(uid: string): Set<string> {
  try {
    const raw = localStorage.getItem(dismissedKey(uid));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(uid: string, ids: Set<string>) {
  localStorage.setItem(dismissedKey(uid), JSON.stringify(Array.from(ids)));
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    if (user) setDismissed(loadDismissed(user.uid));
  }, [user]);

  const visible = notifications.filter((n) => !dismissed.has(n.id));

  const dismiss = (id: string) => {
    if (!user) return;
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(user.uid, next);
  };

  const enableBrowserNotifications = async () => {
    if (typeof Notification === "undefined") {
      toast.error("你的瀏覽器不支援桌面通知");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      toast.success("已啟用瀏覽器通知");
    } else {
      toast.error("未取得通知權限，請至瀏覽器設定手動開啟");
    }
  };

  const sendTestNotification = () => {
    if (permission !== "granted") {
      toast.error("請先啟用瀏覽器通知");
      return;
    }
    new Notification("PrintOS 通知測試", {
      body: "這是一則測試通知，代表桌面通知已正常運作。",
      icon: "/favicon.svg",
    });
  };

  const handleClick = (n: NotificationItem) => {
    navigate(n.link);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold">通知</h2>
          <p className="text-sm text-ink-500 mt-1">
            {visible.length > 0 ? `${visible.length} 則待處理通知` : "目前沒有待處理的通知"}
          </p>
        </div>
      </div>

      <Card className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
            <BellAlertIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium">瀏覽器桌面通知</p>
            <p className="text-xs text-ink-500">
              {permission === "unsupported"
                ? "你的瀏覽器不支援此功能"
                : permission === "granted"
                  ? "已啟用，開著這個分頁時可以收到桌面通知"
                  : "啟用後，這個分頁開著時可收到桌面通知提醒"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {permission !== "granted" && permission !== "unsupported" && (
            <Button size="sm" onClick={enableBrowserNotifications}>
              啟用通知
            </Button>
          )}
          {permission === "granted" && (
            <Button size="sm" variant="secondary" onClick={sendTestNotification}>
              發送測試通知
            </Button>
          )}
        </div>
      </Card>

      {visible.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
            <CheckCircleIcon className="h-6 w-6 text-brand-500" />
          </div>
          <p className="text-sm font-medium">全部處理完畢！</p>
          <p className="text-xs text-ink-500 mt-1">
            列印完成、耗材不足、訂單與交貨、保養提醒都會顯示在這裡
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((n) => {
            const Icon = TYPE_ICON[n.type];
            return (
              <Card
                key={n.id}
                className="flex items-start gap-3 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                onClick={() => handleClick(n)}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    SEVERITY_STYLE[n.severity]
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-xs text-ink-500 truncate">{n.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(n.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
                  aria-label="關閉此通知"
                >
                  <XMarkIcon className="h-4 w-4 text-ink-400" />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-ink-400">
        <BellIcon className="h-3.5 w-3.5" />
        通知會依實際資料即時計算（列印狀態、耗材庫存、訂單、保養排程），關閉的通知只會在這台裝置上隱藏。
      </div>
    </div>
  );
}
