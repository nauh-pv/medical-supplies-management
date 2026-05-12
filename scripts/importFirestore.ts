/**
 * Import dữ liệu từ JSON file → Firestore (môi trường đích)
 *
 * Chạy:
 *   npx tsx scripts/importFirestore.ts --file=data/firestore-export_xxx.json --env=.env.staging
 *   npx tsx scripts/importFirestore.ts --file=data/firestore-export_xxx.json --env=.env.dev
 *
 * Flags:
 *   --file=<path>       (bắt buộc) đường dẫn file JSON đã export
 *   --env=<path>        (mặc định .env.dev) file env của môi trường đích
 *   --clean             xóa toàn bộ docs trong collection trước khi import
 *   --collections=a,b   chỉ import những collections này (whitelist)
 *   --exclude=a,b       bỏ qua những collections này (blacklist)
 *
 * Lưu ý: --collections và --exclude không dùng cùng nhau.
 * Nếu cả hai được cung cấp, --collections được ưu tiên.
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ── Parse CLI args ─────────────────────────────────────────────────────────
function getArg(name: string, fallback: string): string {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : fallback;
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const envFile = getArg("env", ".env.dev");
const inputFile = getArg("file", "");
const cleanFirst = hasFlag("clean");
const onlyCollections = getArg("collections", "");
const excludeCollections = getArg("exclude", "");

if (!inputFile) {
  console.error(
    "❌ Thiếu --file=<path>. VD: --file=data/firestore-export_xxx.json",
  );
  process.exit(1);
}

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

// ── Chuyển serialized Timestamp → Firestore Timestamp ──────────────────────
function deserializeValue(val: unknown): unknown {
  if (val === null || val === undefined) return val;

  if (
    typeof val === "object" &&
    val !== null &&
    "__type" in val &&
    (val as Record<string, unknown>).__type === "Timestamp"
  ) {
    const t = val as { seconds: number; nanoseconds: number };
    return new Timestamp(t.seconds, t.nanoseconds);
  }

  if (Array.isArray(val)) return val.map(deserializeValue);

  if (typeof val === "object" && val !== null) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = deserializeValue(v);
    }
    return result;
  }

  return val;
}

// ── Xác nhận với user ──────────────────────────────────────────────────────
async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const filePath = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File không tồn tại: ${filePath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const meta = raw.__meta;
  const data: Record<string, Record<string, unknown>> = raw.data;

  const targetProject = process.env.VITE_FIREBASE_PROJECT_ID;

  console.log(`\n🔥 Import Firestore`);
  console.log(`   Source: ${meta.projectId} (exported ${meta.exportedAt})`);
  console.log(`   Target: ${targetProject} (env: ${envFile})`);
  console.log(`   Total docs: ${meta.totalDocs}`);
  if (cleanFirst)
    console.log(`   ⚠️  --clean: sẽ xóa docs cũ trước khi import`);
  if (onlyCollections) console.log(`   🔍 Whitelist: ${onlyCollections}`);
  if (!onlyCollections && excludeCollections)
    console.log(`   🚫 Blacklist: ${excludeCollections}`);
  console.log();

  const ok = await confirm(
    `Bạn có chắc muốn import vào project "${targetProject}"?`,
  );
  if (!ok) {
    console.log("Đã hủy.");
    process.exit(0);
  }

  const filterCols = onlyCollections
    ? onlyCollections.split(",").map((s) => s.trim())
    : null;
  const excludeCols =
    !onlyCollections && excludeCollections
      ? excludeCollections.split(",").map((s) => s.trim())
      : null;

  let totalImported = 0;

  for (const [colName, docs] of Object.entries(data)) {
    if (filterCols && !filterCols.includes(colName)) {
      console.log(`  ⏭ ${colName} (skipped — not in whitelist)`);
      continue;
    }
    if (excludeCols && excludeCols.includes(colName)) {
      console.log(`  ⏭ ${colName} (skipped — excluded)`);
      continue;
    }

    // Xóa docs cũ nếu --clean
    if (cleanFirst) {
      const existing = await getDocs(collection(db, colName));
      if (!existing.empty) {
        const delBatch = writeBatch(db);
        existing.forEach((d) => delBatch.delete(d.ref));
        await delBatch.commit();
        console.log(`  🗑 ${colName}: xóa ${existing.size} docs cũ`);
      }
    }

    // Import theo batch (max 500 per batch — Firestore limit)
    const entries = Object.entries(docs);
    const BATCH_SIZE = 450;

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const chunk = entries.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      for (const [docId, docData] of chunk) {
        const deserialized = deserializeValue(docData) as Record<
          string,
          unknown
        >;
        batch.set(doc(db, colName, docId), deserialized);
      }

      await batch.commit();
    }

    totalImported += entries.length;
    console.log(`  ✓ ${colName}: ${entries.length} docs`);
  }

  console.log(
    `\n✅ Imported ${totalImported} docs vào project "${targetProject}"\n`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
