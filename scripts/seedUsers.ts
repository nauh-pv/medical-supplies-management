import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Load service account — đặt file serviceAccount.json cùng thư mục scripts/
const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "serviceAccount.json"), "utf-8"),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const users = [
  {
    uid: "RDwq9taTeAUfieRyyLJAaBC4MqT2",
    email: "cn2@gmail.com",
    displayName: "Chi nhánh 2",
    phone: "0123456789",
    role: "branch",
    branchId: "CN002",
    branchName: "Chi nhánh 2",
    isActive: true,
  },
  {
    uid: "uHe4ICZgQWaNImXi8cM3Bpz0vRH2",
    email: "cn1@gmail.com",
    displayName: "Chi nhánh 1",
    phone: "0123456789",
    role: "branch",
    branchId: "CN001",
    branchName: "Chi nhánh 1",
    isActive: true,
  },
  {
    uid: "tJqJhkCUyQao2mXe28aLRrkJrDF2",
    email: "admin@gmail.com",
    displayName: "Quản lý Kho Tổng",
    phone: "0123456789",
    role: "warehouse_manager",
    branchId: "WAREHOUSE",
    branchName: "Kho Tổng",
    isActive: true,
  },
  {
    uid: "P9gDmgRutTOZCzMVC3nZMKKi3Mi1",
    email: "huan@gmail.com",
    displayName: "Chi nhánh 3",
    phone: "0123456789",
    role: "branch",
    branchId: "CN003",
    branchName: "Chi nhánh 3",
    isActive: true,
  },
  {
    uid: "Rnu0ystJMUalKaKyzx7sVGU1ugn2",
    email: "vahuana4k56@gmail.com",
    displayName: "Chi nhánh 4",
    phone: "0123456789",
    role: "branch",
    branchId: "CN004",
    branchName: "Chi nhánh 4",
    isActive: true,
  },
];

async function seed() {
  const now = admin.firestore.FieldValue.serverTimestamp();
  for (const user of users) {
    await db
      .collection("users")
      .doc(user.uid)
      .set({
        ...user,
        createdAt: now,
        updatedAt: now,
      });
    console.log("✓ Seeded:", user.email);
  }
  console.log("\nDone! Seeded 5 user profiles.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
