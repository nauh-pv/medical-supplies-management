import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  getAuth,
  type User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { auth, db, firebaseConfig } from "./firebase";

export type { User };

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: string,
  phone = "",
  branchName = "",
  branchCode = "",
  branchAddress = "",
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = credential.user;

  await updateProfile(user, { displayName });

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    displayName,
    phone,
    role,
    branchId: role === "branch" ? user.uid : null,
    branchName: role === "branch" ? branchName || null : null,
    branchCode: role === "branch" ? branchCode || null : null,
    branchAddress: role === "branch" ? branchAddress || null : null,
    status: "active",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Creates a branch user account WITHOUT affecting the currently signed-in admin session.
 * Uses a temporary secondary Firebase app instance.
 */
export async function adminCreateBranchUser(
  email: string,
  password: string,
  displayName: string,
  phone: string,
  branchName: string,
  branchCode: string,
  branchAddress: string,
): Promise<void> {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    const user = credential.user;
    await updateProfile(user, { displayName });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      phone,
      role: "branch",
      branchId: user.uid,
      branchName: branchName || null,
      branchCode: branchCode || null,
      branchAddress: branchAddress || null,
      status: "active",
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } finally {
    await firebaseSignOut(secondaryAuth);
    await deleteApp(secondaryApp);
  }
}

export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
