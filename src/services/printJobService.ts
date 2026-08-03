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
import type { PrintJob, PrintJobFormValues } from "@/types";
import { uploadJobPhoto, deleteJobPhotoByURL } from "./storageService";

/** 取得該使用者的列印工作集合參照（資料完全隔離於 users/{uid}/printJobs 底下） */
function printJobsCollection(uid: string) {
  return collection(db, "users", uid, "printJobs");
}

/**
 * 即時訂閱使用者的所有列印工作，供 Dashboard 統計卡片、圖表與列印作品管理頁使用。
 * 回傳取消訂閱函式，元件卸載時務必呼叫以避免記憶體洩漏。
 */
export function subscribeToPrintJobs(
  uid: string,
  onData: (jobs: PrintJob[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const q = query(printJobsCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const jobs = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as PrintJob
      );
      onData(jobs);
    },
    (err) => {
      console.error("讀取列印工作失敗", err);
      onError("無法載入列印資料，請稍後重試");
    }
  );
}

/**
 * 新增一筆列印工作。先建立文件取得 ID，若有照片再上傳並補上 photoURL，
 * 這樣 Storage 路徑（users/{uid}/printJobs/{jobId}/...）才能對應到正確的文件。
 */
export async function addPrintJob(
  uid: string,
  values: PrintJobFormValues
): Promise<string> {
  const { photoFile, existingPhotoURL, ...rest } = values;

  const docRef = await addDoc(printJobsCollection(uid), {
    ...rest,
    userId: uid,
    photoURL: existingPhotoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (photoFile) {
    const url = await uploadJobPhoto(uid, docRef.id, photoFile);
    await updateDoc(docRef, { photoURL: url });
  }

  return docRef.id;
}

/** 更新既有的列印工作，若使用者上傳了新照片則一併處理上傳與覆蓋 */
export async function updatePrintJob(
  uid: string,
  jobId: string,
  values: PrintJobFormValues
): Promise<void> {
  const { photoFile, existingPhotoURL, ...rest } = values;
  const docRef = doc(db, "users", uid, "printJobs", jobId);

  let photoURL = existingPhotoURL ?? null;
  if (photoFile) {
    photoURL = await uploadJobPhoto(uid, jobId, photoFile);
  }

  await updateDoc(docRef, {
    ...rest,
    photoURL,
    updatedAt: serverTimestamp(),
  });
}

/** 刪除列印工作，並嘗試一併清除已上傳的照片 */
export async function deletePrintJob(
  uid: string,
  jobId: string,
  photoURL: string | null
): Promise<void> {
  const docRef = doc(db, "users", uid, "printJobs", jobId);
  await deleteDoc(docRef);
  if (photoURL) {
    await deleteJobPhotoByURL(photoURL);
  }
}
