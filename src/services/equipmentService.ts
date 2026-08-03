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
import type { Equipment, EquipmentFormValues } from "@/types";

function equipmentCollection(uid: string) {
  return collection(db, "users", uid, "equipment");
}

export function subscribeToEquipment(
  uid: string,
  onData: (items: Equipment[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(equipmentCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Equipment));
    },
    (err) => {
      console.error("讀取設備資料失敗", err);
      onError("無法載入設備資料，請稍後重試");
    }
  );
}

export async function addEquipment(
  uid: string,
  values: EquipmentFormValues
): Promise<string> {
  const docRef = await addDoc(equipmentCollection(uid), {
    ...values,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEquipment(
  uid: string,
  equipmentId: string,
  values: EquipmentFormValues
): Promise<void> {
  const docRef = doc(db, "users", uid, "equipment", equipmentId);
  await updateDoc(docRef, { ...values, updatedAt: serverTimestamp() });
}

export async function deleteEquipment(
  uid: string,
  equipmentId: string
): Promise<void> {
  const docRef = doc(db, "users", uid, "equipment", equipmentId);
  await deleteDoc(docRef);
}
