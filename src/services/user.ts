import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserDoc } from "@/types/firestore";

export async function getUserProfile(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}
