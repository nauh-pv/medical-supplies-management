/**
 * Fetch all active batches from Firestore (WAREHOUSE)
 *
 * Chạy: npx tsx scripts/fetchBatches.ts
 * Tùy chọn: npx tsx scripts/fetchBatches.ts --location=WAREHOUSE --status=active
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
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

// ── Parse CLI args ─────────────────────────────────────────────────────────
function getArg(name: string, fallback: string): string {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : fallback;
}

const locationId = getArg("location", "WAREHOUSE");
const status = getArg("status", "active");

async function main() {
  console.log(
    `\n📦 Fetching batches — locationId="${locationId}", status="${status}"\n`,
  );

  const q = query(
    collection(db, "batches"),
    where("locationId", "==", locationId),
    where("status", "==", status),
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    console.log("Không tìm thấy batch nào.");
    process.exit(0);
  }

  const batches = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a: any, b: any) =>
      (a.medicineName ?? "").localeCompare(b.medicineName ?? "", "vi"),
    );

  console.log(`Tổng: ${batches.length} batch(es)\n`);
  console.table(
    batches.map((b: any) => ({
      id: b.id,
      medicineName: b.medicineName,
      sku: b.medicineSku,
      lot: b.lot,
      quantity: b.quantity,
      initialQuantity: b.initialQuantity,
      importPrice: b.importPrice,
      locationId: b.locationId,
      status: b.status,
      supplierName: b.supplierName,
      expiryDate: b.expiryDate?.toDate?.()?.toISOString?.() ?? "—",
    })),
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
