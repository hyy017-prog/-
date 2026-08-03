import clsx, { type ClassValue } from "clsx";

/** 合併並過濾條件式 Tailwind class */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
