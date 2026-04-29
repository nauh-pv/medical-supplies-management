/**
 * Tìm batch theo ID và sửa expiryDate
 *
 * Chạy: npx tsx scripts/fixBatchExpiry.ts
 * Chỉ xem (không sửa): npx tsx scripts/fixBatchExpiry.ts --dry
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config();

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

const BATCH_ID = "qPoSzT06cLHo7pxUtqtu";
// 12/12/2028 00:00:00 UTC
const CORRECT_EXPIRY = Timestamp.fromDate(new Date("2028-12-12T00:00:00Z"));

const dryRun = process.argv.includes("--dry");

async function main() {
  const ref = doc(db, "batches", BATCH_ID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.log(`❌ Batch "${BATCH_ID}" không tồn tại.`);
    process.exit(1);
  }

  const data = snap.data();
  console.log("\n📦 Batch hiện tại:");
  console.log(
    JSON.stringify(
      {
        id: snap.id,
        medicineName: data.medicineName,
        lot: data.lot,
        quantity: data.quantity,
        expiryDate: data.expiryDate,
        expiryDateReadable:
          data.expiryDate?.toDate?.()?.toISOString() ?? "INVALID",
      },
      null,
      2,
    ),
  );

  //   if (dryRun) {
  //     console.log("\n🔍 Dry run — không thay đổi gì.");
  //     console.log(`Giá trị expiryDate mới sẽ là: ${CORRECT_EXPIRY.toDate().toISOString()} (seconds: ${CORRECT_EXPIRY.seconds})`);
  //     process.exit(0);
  //   }

  //   await updateDoc(ref, { expiryDate: CORRECT_EXPIRY });
  //   console.log(`\n✅ Đã cập nhật expiryDate → ${CORRECT_EXPIRY.toDate().toISOString()} (seconds: ${CORRECT_EXPIRY.seconds})`);
  //   process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
