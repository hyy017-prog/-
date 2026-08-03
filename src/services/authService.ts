import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/firebase/config";
import type { UserProfile } from "@/types";

/** 若 Firestore 尚無此使用者的個人資料文件，建立一份預設值 */
async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile: Omit<UserProfile, "createdAt"> & { createdAt: unknown } = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      settings: {
        electricityRatePerKwh: 4.5,
        laborRatePerHour: 200,
        defaultMarkup: 2,
      },
    };
    await setDoc(ref, profile);
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

/** 將 Firebase Auth 的錯誤代碼轉為中文提示 */
export function translateAuthError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "此 Email 已被註冊",
    "auth/invalid-email": "Email 格式不正確",
    "auth/weak-password": "密碼強度不足，至少需要 6 個字元",
    "auth/user-not-found": "帳號不存在",
    "auth/wrong-password": "密碼錯誤",
    "auth/invalid-credential": "帳號或密碼錯誤",
    "auth/popup-closed-by-user": "登入視窗已關閉",
    "auth/too-many-requests": "嘗試次數過多，請稍後再試",
  };
  return map[code] ?? "發生未知錯誤，請稍後再試";
}
