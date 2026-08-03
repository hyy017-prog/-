import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { DEFAULT_COST_SETTINGS, type CostSettings } from "@/types";

/** 讀取使用者的成本計算設定，若尚未設定過則回傳預設值 */
export async function getCostSettings(uid: string): Promise<CostSettings> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data();
  return { ...DEFAULT_COST_SETTINGS, ...(data?.settings ?? {}) };
}

/** 更新使用者的成本計算設定（merge，不影響其他個人資料欄位） */
export async function updateCostSettings(
  uid: string,
  settings: CostSettings
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { settings }, { merge: true });
}
