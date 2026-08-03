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
import type { Order, OrderFormValues } from "@/types";

function ordersCollection(uid: string) {
  return collection(db, "users", uid, "orders");
}

export function subscribeToOrders(
  uid: string,
  onData: (orders: Order[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(ordersCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
    },
    (err) => {
      console.error("讀取訂單資料失敗", err);
      onError("無法載入訂單資料，請稍後重試");
    }
  );
}

export async function addOrder(
  uid: string,
  values: OrderFormValues,
  customerName: string
): Promise<string> {
  const docRef = await addDoc(ordersCollection(uid), {
    ...values,
    customerName,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateOrder(
  uid: string,
  orderId: string,
  values: OrderFormValues,
  customerName: string
): Promise<void> {
  const docRef = doc(db, "users", uid, "orders", orderId);
  await updateDoc(docRef, { ...values, customerName, updatedAt: serverTimestamp() });
}

export async function deleteOrder(uid: string, orderId: string): Promise<void> {
  const docRef = doc(db, "users", uid, "orders", orderId);
  await deleteDoc(docRef);
}
