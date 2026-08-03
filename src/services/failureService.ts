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
import type { FailureRecord, FailureRecordFormValues } from "@/types";

function failuresCollection(uid: string) {
  return collection(db, "users", uid, "failureRecords");
}

export function subscribeToFailureRecords(
  uid: string,
  onData: (records: FailureRecord[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(failuresCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FailureRecord));
    },
    (err) => {
      console.error("讀取失敗案例資料失敗", err);
      onError("無法載入失敗案例資料，請稍後重試");
    }
  );
}

export async function addFailureRecord(
  uid: string,
  values: FailureRecordFormValues
): Promise<string> {
  const docRef = await addDoc(failuresCollection(uid), {
    ...values,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateFailureRecord(
  uid: string,
  recordId: string,
  values: FailureRecordFormValues
): Promise<void> {
  const docRef = doc(db, "users", uid, "failureRecords", recordId);
  await updateDoc(docRef, { ...values, updatedAt: serverTimestamp() });
}

export async function deleteFailureRecord(
  uid: string,
  recordId: string
): Promise<void> {
  const docRef = doc(db, "users", uid, "failureRecords", recordId);
  await deleteDoc(docRef);
}
