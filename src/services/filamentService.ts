import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Filament, FilamentFormValues } from "@/types";

function filamentsCollection(uid: string) {
  return collection(db, "users", uid, "filaments");
}

/** 即時訂閱使用者的耗材庫存，供耗材管理頁與成本計算頁使用 */
export function subscribeToFilaments(
  uid: string,
  onData: (filaments: Filament[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(filamentsCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const filaments = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Filament
      );
      onData(filaments);
    },
    (err) => {
      console.error("讀取耗材資料失敗", err);
      onError("無法載入耗材資料，請稍後重試");
    }
  );
}

export async function addFilament(
  uid: string,
  values: FilamentFormValues
): Promise<string> {
  const docRef = await addDoc(filamentsCollection(uid), {
    ...values,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateFilament(
  uid: string,
  filamentId: string,
  values: FilamentFormValues
): Promise<void> {
  const docRef = doc(db, "users", uid, "filaments", filamentId);
  await updateDoc(docRef, {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFilament(
  uid: string,
  filamentId: string
): Promise<void> {
  const docRef = doc(db, "users", uid, "filaments", filamentId);
  await deleteDoc(docRef);
}
