import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/firebase/config";

/** 上傳作品照片至 users/{uid}/printJobs/{jobId}/photo.{ext}，回傳可公開存取的下載網址 */
export async function uploadJobPhoto(
  uid: string,
  jobId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `users/${uid}/printJobs/${jobId}/photo.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/** 依下載網址刪除 Storage 中的照片，失敗時僅記錄不拋出（避免阻擋刪除工作本身） */
export async function deleteJobPhotoByURL(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("刪除照片失敗（可能已不存在）", err);
  }
}
