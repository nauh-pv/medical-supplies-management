/**
 * Script migrate UID chi nhánh
 *
 * Dùng khi: tạo nhầm email khi đăng ký chi nhánh, đã tạo lại account mới
 * đúng email → cần chuyển toàn bộ Firestore data sang UID mới.
 *
 * Chạy:
 *   npx tsx scripts/migrateBranchUid.ts <OLD_UID> <NEW_UID>
 *
 * Ví dụ:
 *   npx tsx scripts/migrateBranchUid.ts abc123olduid xyz789newuid
 *
 * Yêu cầu: VITE_FIREBASE_* env vars phải có trong .env
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

//use npx tsx scripts/migrateBranchUid.ts <OLD_UID> <NEW_UID>

function getArg(name: string, fallback: string): string {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : fallback;
}

const envFile = getArg("env", ".env.dev");
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const OLD_UID = process.argv[2];
const NEW_UID = process.argv[3];

if (!OLD_UID || !NEW_UID) {
  console.error(
    "❌ Thiếu tham số! Cú pháp: npx tsx scripts/migrateBranchUid.ts <OLD_UID> <NEW_UID>",
  );
  process.exit(1);
}

if (OLD_UID === NEW_UID) {
  console.error("❌ OLD_UID và NEW_UID phải khác nhau!");
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log(`\n🔄 Bắt đầu migrate UID:`);
  console.log(`   OLD: ${OLD_UID}`);
  console.log(`   NEW: ${NEW_UID}\n`);

  // ── 1. Đọc document users/{oldUID} ───────────────────────────────────────
  const oldRef = doc(db, "users", OLD_UID);
  const oldSnap = await getDoc(oldRef);

  if (!oldSnap.exists()) {
    console.error(
      `❌ Không tìm thấy document users/${OLD_UID}. Hãy kiểm tra lại OLD_UID.`,
    );
    process.exit(1);
  }

  const oldData = oldSnap.data();
  console.log(`✅ Tìm thấy user: ${oldData.displayName} (${oldData.email})`);

  if (oldData.role !== "branch") {
    console.warn(
      `⚠️  User này có role "${oldData.role}", không phải "branch". Tiếp tục...`,
    );
  }

  // ── 2. Kiểm tra users/{newUID} đã tồn tại chưa ──────────────────────────
  const newRef = doc(db, "users", NEW_UID);
  const newSnap = await getDoc(newRef);

  if (newSnap.exists()) {
    console.error(
      `❌ Document users/${NEW_UID} đã tồn tại! Xóa nó trước hoặc kiểm tra lại NEW_UID.`,
    );
    process.exit(1);
  }

  // ── 3. Tạo document mới tại users/{newUID} ───────────────────────────────
  const newData = {
    ...oldData,
    uid: NEW_UID,
    branchId: NEW_UID, // branchId của branch user = chính uid của nó
  };

  await setDoc(newRef, newData);
  console.log(`✅ Đã tạo users/${NEW_UID}`);

  // ── 4. Update các collection liên quan ──────────────────────────────────
  let totalUpdated = 0;

  // 4a. inventory — locationId
  totalUpdated += await batchUpdateField(
    "inventory",
    "locationId",
    OLD_UID,
    NEW_UID,
  );

  // 4b. batches — locationId
  totalUpdated += await batchUpdateField(
    "batches",
    "locationId",
    OLD_UID,
    NEW_UID,
  );

  // 4c. dispatch_orders — toLocationId
  totalUpdated += await batchUpdateField(
    "dispatch_orders",
    "toLocationId",
    OLD_UID,
    NEW_UID,
  );

  // 4d. dispatch_orders — fromLocationId (hiếm gặp với branch nhưng kiểm tra cho chắc)
  totalUpdated += await batchUpdateField(
    "dispatch_orders",
    "fromLocationId",
    OLD_UID,
    NEW_UID,
  );

  // 4e. dispatch_orders — createdBy
  totalUpdated += await batchUpdateField(
    "dispatch_orders",
    "createdBy",
    OLD_UID,
    NEW_UID,
  );

  // 4f. import_requests — branchId
  totalUpdated += await batchUpdateField(
    "import_requests",
    "branchId",
    OLD_UID,
    NEW_UID,
  );

  // 4g. import_requests — createdBy
  totalUpdated += await batchUpdateField(
    "import_requests",
    "createdBy",
    OLD_UID,
    NEW_UID,
  );

  // 4h. pos_transactions — branchId
  totalUpdated += await batchUpdateField(
    "pos_transactions",
    "branchId",
    OLD_UID,
    NEW_UID,
  );

  // 4i. pos_transactions — createdBy
  totalUpdated += await batchUpdateField(
    "pos_transactions",
    "createdBy",
    OLD_UID,
    NEW_UID,
  );

  // 4j. import_orders — createdBy
  totalUpdated += await batchUpdateField(
    "import_orders",
    "createdBy",
    OLD_UID,
    NEW_UID,
  );

  console.log(
    `\n✅ Đã update ${totalUpdated} document(s) trong các collection liên quan`,
  );

  // ── 5. Xóa document cũ ───────────────────────────────────────────────────
  await deleteDoc(oldRef);
  console.log(`✅ Đã xóa users/${OLD_UID}`);

  console.log(`\n🎉 Migrate hoàn tất!`);
  console.log(`   Chi nhánh "${oldData.displayName}" giờ dùng UID: ${NEW_UID}`);
  console.log(
    `   Hãy đảm bảo xóa account Firebase Auth cũ (${OLD_UID}) trong Firebase Console nếu chưa xóa.\n`,
  );

  process.exit(0);
}

async function batchUpdateField(
  collectionName: string,
  field: string,
  oldValue: string,
  newValue: string,
): Promise<number> {
  const q = query(collection(db, collectionName), where(field, "==", oldValue));
  const snap = await getDocs(q);

  if (snap.empty) return 0;

  // Firestore batch tối đa 500 writes
  const chunks: (typeof snap.docs)[] = [];
  for (let i = 0; i < snap.docs.length; i += 499) {
    chunks.push(snap.docs.slice(i, i + 499));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const d of chunk) {
      batch.update(d.ref, { [field]: newValue });
    }
    await batch.commit();
  }

  console.log(`   📄 ${collectionName}.${field}: updated ${snap.size} doc(s)`);
  return snap.size;
}

main().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
