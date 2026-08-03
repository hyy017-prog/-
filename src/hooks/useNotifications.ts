import { useMemo } from "react";
import { useFilaments } from "./useFilaments";
import { usePrintJobStats } from "./usePrintJobStats";
import { useOrders } from "./useOrders";
import { useEquipment, getMaintenanceStatus } from "./useEquipment";
import { formatDate } from "@/utils/format";

export type NotificationSeverity = "info" | "warning" | "danger";
export type NotificationType =
  | "print_complete"
  | "low_stock"
  | "order_unpaid"
  | "delivery_due"
  | "maintenance_due";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  severity: NotificationSeverity;
  link: string;
}

const RECENT_DAYS = 3; // 「最近完成」「即將交貨」的判定天數

export function useNotifications() {
  const { lowStockFilaments } = useFilaments();
  const { stats } = usePrintJobStats();
  const { orders } = useOrders();
  const { equipment } = useEquipment();

  const notifications = useMemo(() => {
    const items: NotificationItem[] = [];
    const now = Date.now();
    const recentMs = RECENT_DAYS * 24 * 60 * 60 * 1000;

    // 列印完成
    stats.allJobs
      .filter((j) => j.status === "completed" && j.completedDate)
      .filter((j) => now - j.completedDate!.toDate().getTime() <= recentMs)
      .forEach((j) => {
        items.push({
          id: `print-${j.id}`,
          type: "print_complete",
          title: `「${j.name}」已完成`,
          description: `完成於 ${formatDate(j.completedDate)}`,
          severity: "info",
          link: "/jobs",
        });
      });

    // 耗材不足
    lowStockFilaments.forEach((f) => {
      items.push({
        id: `filament-${f.id}`,
        type: "low_stock",
        title: `${f.brand} ${f.material} ${f.color} 庫存偏低`,
        description: `剩餘 ${f.remainingGrams}g，低於門檻 ${f.lowStockThreshold}g`,
        severity: "warning",
        link: "/filaments",
      });
    });

    // 訂單提醒（未付款）
    orders
      .filter((o) => o.paymentStatus === "unpaid")
      .forEach((o) => {
        items.push({
          id: `order-unpaid-${o.id}`,
          type: "order_unpaid",
          title: `訂單「${o.productName}」尚未付款`,
          description: `客戶：${o.customerName}`,
          severity: "warning",
          link: "/orders",
        });
      });

    // 交貨提醒（3 天內到期或已逾期，且尚未標記已付款完成出貨的簡化判斷：非必要欄位，僅用日期判斷）
    orders
      .filter((o) => o.deliveryDate)
      .forEach((o) => {
        const deliveryTime = o.deliveryDate!.toDate().getTime();
        const diff = deliveryTime - now;
        if (diff <= recentMs) {
          items.push({
            id: `delivery-${o.id}`,
            type: "delivery_due",
            title: diff < 0 ? `訂單「${o.productName}」已逾交貨期` : `訂單「${o.productName}」即將交貨`,
            description: `交貨日期：${formatDate(o.deliveryDate)} · 客戶：${o.customerName}`,
            severity: diff < 0 ? "danger" : "warning",
            link: "/orders",
          });
        }
      });

    // 保養提醒
    equipment.forEach((e) => {
      const { status, daysRemaining } = getMaintenanceStatus(e);
      if (status === "ok") return;
      items.push({
        id: `equipment-${e.id}`,
        type: "maintenance_due",
        title: `「${e.name}」需要保養`,
        description:
          daysRemaining !== null && daysRemaining <= 0
            ? `已逾期 ${Math.abs(daysRemaining)} 天`
            : `剩 ${daysRemaining} 天`,
        severity: status === "overdue" ? "danger" : "warning",
        link: "/equipment",
      });
    });

    return items;
  }, [lowStockFilaments, stats.allJobs, orders, equipment]);

  return { notifications };
}
