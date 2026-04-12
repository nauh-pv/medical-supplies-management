import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { UserDoc } from "@/types/firestore";

export async function getUserProfile(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

export async function updateBranchUser(
  uid: string,
  updates: {
    displayName?: string;
    phone?: string;
    branchName?: string;
    branchCode?: string;
    branchAddress?: string;
    status?: "active" | "paused";
  },
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
