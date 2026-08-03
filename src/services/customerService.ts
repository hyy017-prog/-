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
import type { Customer, CustomerFormValues } from "@/types";

function customersCollection(uid: string) {
  return collection(db, "users", uid, "customers");
}

export function subscribeToCustomers(
  uid: string,
  onData: (customers: Customer[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(customersCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Customer));
    },
    (err) => {
      console.error("讀取客戶資料失敗", err);
      onError("無法載入客戶資料，請稍後重試");
    }
  );
}

export async function addCustomer(
  uid: string,
  values: CustomerFormValues
): Promise<string> {
  const docRef = await addDoc(customersCollection(uid), {
    ...values,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCustomer(
  uid: string,
  customerId: string,
  values: CustomerFormValues
): Promise<void> {
  const docRef = doc(db, "users", uid, "customers", customerId);
  await updateDoc(docRef, { ...values, updatedAt: serverTimestamp() });
}

export async function deleteCustomer(
  uid: string,
  customerId: string
): Promise<void> {
  const docRef = doc(db, "users", uid, "customers", customerId);
  await deleteDoc(docRef);
}
