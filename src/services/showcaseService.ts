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
import type { ShowcaseItem, ShowcaseItemFormValues } from "@/types";

function showcaseCollection(uid: string) {
  return collection(db, "users", uid, "showcaseItems");
}

export function subscribeToShowcaseItems(
  uid: string,
  onData: (items: ShowcaseItem[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(showcaseCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ShowcaseItem));
    },
    (err) => {
      console.error("讀取作品展示資料失敗", err);
      onError("無法載入作品展示資料，請稍後重試");
    }
  );
}

export async function addShowcaseItem(
  uid: string,
  values: ShowcaseItemFormValues
): Promise<string> {
  const docRef = await addDoc(showcaseCollection(uid), {
    ...values,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateShowcaseItem(
  uid: string,
  itemId: string,
  values: Partial<ShowcaseItemFormValues>
): Promise<void> {
  const docRef = doc(db, "users", uid, "showcaseItems", itemId);
  await updateDoc(docRef, { ...values, updatedAt: serverTimestamp() });
}

export async function deleteShowcaseItem(
  uid: string,
  itemId: string
): Promise<void> {
  const docRef = doc(db, "users", uid, "showcaseItems", itemId);
  await deleteDoc(docRef);
}
