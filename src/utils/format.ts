import type { Timestamp } from "firebase/firestore";

export function formatCurrency(n: number): string {
  return `NT$ ${Math.round(n).toLocaleString("zh-TW")}`;
}

export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} 分`;
  if (m === 0) return `${h} 小時`;
  return `${h} 小時 ${m} 分`;
}

export function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts) return "-";
  return ts.toDate().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** 將 <input type="date"> 的字串值轉換為當地時區午間時間，避免存成 Timestamp 後跨時區日期跑掉 */
export function dateInputToDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function timestampToDateInputValue(ts: Timestamp | null | undefined): string {
  if (!ts) return "";
  const d = ts.toDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
