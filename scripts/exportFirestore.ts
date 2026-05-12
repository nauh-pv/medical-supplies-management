/**
 * Export toàn bộ dữ liệu Firestore → JSON file
 *
 * Chạy:
 *   npx tsx scripts/exportFirestore.ts                     # load .env.production (mặc định)
 *   npx tsx scripts/exportFirestore.ts --env=.env.staging   # load .env.staging
 *   npx tsx scripts/exportFirestore.ts --out=backup.json    # custom output file
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// ── Parse CLI args ─────────────────────────────────────────────────────────
function getArg(name: string, fallback: string): string {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : fallback;
}

const envFile = getArg("env", ".env.production");
const outputFile = getArg("out", "");

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

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

// ── Tất cả collections cần export ─────────────────────────────────────────
const COLLECTIONS = [
  "users",
  "medicines",
  "inventory",
  "batches",
  "suppliers",
  "units",
  "branches",
  "import_orders",
  "dispatch_orders",
  "import_requests",
  "pos_transactions",
];

// ── Chuyển Firestore Timestamp → serializable object ───────────────────────
function serializeValue(val: unknown): unknown {
  if (val === null || val === undefined) return val;

  // Firestore Timestamp object
  if (
    typeof val === "object" &&
    val !== null &&
    "seconds" in val &&
    "nanoseconds" in val
  ) {
    return {
      __type: "Timestamp",
      seconds: (val as { seconds: number }).seconds,
      nanoseconds: (val as { nanoseconds: number }).nanoseconds,
    };
  }

  if (Array.isArray(val)) return val.map(serializeValue);

  if (typeof val === "object" && val !== null) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = serializeValue(v);
    }
    return result;
  }

  return val;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  console.log(`\n🔥 Exporting Firestore from project: ${projectId}`);
  console.log(`   Env file: ${envFile}\n`);

  const exportData: Record<string, Record<string, unknown>> = {};
  let totalDocs = 0;

  for (const col of COLLECTIONS) {
    const snap = await getDocs(collection(db, col));
    const docs: Record<string, unknown> = {};

    snap.forEach((docSnap) => {
      docs[docSnap.id] = serializeValue(docSnap.data());
    });

    const count = Object.keys(docs).length;
    exportData[col] = docs;
    totalDocs += count;
    console.log(`  ✓ ${col}: ${count} docs`);
  }

  // ── Tạo output ──────────────────────────────────────────────────────────
  const timestamp = new Date().toISOString().slice(0, 10);
  const outDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = outputFile
    ? path.resolve(process.cwd(), outputFile)
    : path.join(outDir, `firestore-export_${projectId}_${timestamp}.json`);

  const payload = {
    __meta: {
      exportedAt: new Date().toISOString(),
      projectId,
      envFile,
      totalDocs,
      collections: COLLECTIONS,
    },
    data: exportData,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");

  console.log(`\n✅ Exported ${totalDocs} docs → ${outPath}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Export failed:", err);
  process.exit(1);
});
