/**
 * Firebase seed script — khởi tạo dữ liệu mẫu cho Firestore
 *
 * Chạy: npx tsx scripts/seed.ts
 *
 * Yêu cầu: VITE_FIREBASE_* env vars phải có trong .env
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ── Load env (Vite-style) ──────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────────────
function ts(dateStr: string) {
  return Timestamp.fromDate(new Date(dateStr));
}

// ── Seed data ──────────────────────────────────────────────────────────────

async function seedUnits() {
  console.log("Seeding units...");
  const batch = writeBatch(db);

  const units = [
    { id: "vien", name: "Viên", description: "Đơn vị viên thuốc" },
    { id: "hop", name: "Hộp", description: "Đơn vị hộp thuốc" },
    { id: "chai", name: "Chai", description: "Đơn vị chai dung dịch" },
    { id: "tuyp", name: "Tuýp", description: "Đơn vị tuýp kem/gel" },
    { id: "goi", name: "Gói", description: "Đơn vị gói bột/sachet" },
    { id: "lo", name: "Lọ", description: "Đơn vị lọ thuốc tiêm/nhỏ mắt" },
    { id: "ong", name: "Ống", description: "Đơn vị ống tiêm" },
    { id: "mieng", name: "Miếng", description: "Đơn vị miếng dán" },
  ];

  for (const unit of units) {
    batch.set(doc(db, "units", unit.id), {
      ...unit,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`  ✓ ${units.length} units`);
}

async function seedBranches() {
  console.log("Seeding branches...");
  const batch = writeBatch(db);

  const branches = [
    {
      id: "WAREHOUSE",
      code: "KHO",
      name: "Kho Tổng",
      address: "123 Đường Kho, Quận 1, TP.HCM",
      phone: "028-1234-5678",
      managerId: "",
      managerName: "Chưa phân công",
      status: "active",
    },
    {
      id: "CN001",
      code: "CN001",
      name: "Chi nhánh Quận 1",
      address: "456 Lê Lợi, Quận 1, TP.HCM",
      phone: "028-2345-6789",
      managerId: "",
      managerName: "Chưa phân công",
      status: "active",
    },
    {
      id: "CN002",
      code: "CN002",
      name: "Chi nhánh Quận 3",
      address: "789 Võ Thị Sáu, Quận 3, TP.HCM",
      phone: "028-3456-7890",
      managerId: "",
      managerName: "Chưa phân công",
      status: "active",
    },
    {
      id: "CN003",
      code: "CN003",
      name: "Chi nhánh Bình Thạnh",
      address: "101 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM",
      phone: "028-4567-8901",
      managerId: "",
      managerName: "Chưa phân công",
      status: "active",
    },
  ];

  for (const branch of branches) {
    batch.set(doc(db, "branches", branch.id), {
      ...branch,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`  ✓ ${branches.length} branches`);
}

async function seedSuppliers() {
  console.log("Seeding suppliers...");
  const batch = writeBatch(db);

  const suppliers = [
    {
      id: "NCC001",
      code: "NCC001",
      name: "Công ty TNHH Dược phẩm Hậu Giang",
      phone: "0710-3822-985",
      email: "info@dhg.com.vn",
      address: "288 Bis Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ",
      isActive: true,
    },
    {
      id: "NCC002",
      code: "NCC002",
      name: "Công ty CP Dược Phẩm Imexpharm",
      phone: "0277-3955-262",
      email: "info@imexpharm.com",
      address: "KCN Sóng Thần, Bình Dương",
      isActive: true,
    },
    {
      id: "NCC003",
      code: "NCC003",
      name: "Công ty Dược Phẩm Traphaco",
      phone: "024-3827-6216",
      email: "info@traphaco.com.vn",
      address: "75 Yên Ninh, Ba Đình, Hà Nội",
      isActive: true,
    },
  ];

  for (const supplier of suppliers) {
    batch.set(doc(db, "suppliers", supplier.id), {
      ...supplier,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`  ✓ ${suppliers.length} suppliers`);
}

async function seedMedicines() {
  console.log("Seeding medicines...");
  const batch = writeBatch(db);

  const medicines = [
    {
      id: "MED-001",
      sku: "MED-001",
      name: "Paracetamol 500mg",
      description: "Hạ sốt, giảm đau nhẹ đến vừa",
      category: "otc",
      unitId: "vien",
      unitName: "Viên",
      importPrice: 500,
      sellPrice: 1000,
      minStockLevel: 1000,
      imageUrl: null,
      icon: "medication",
      iconBg: "bg-primary-fixed",
      iconColor: "text-primary",
      isActive: true,
    },
    {
      id: "MED-002",
      sku: "MED-002",
      name: "Amoxicillin 500mg",
      description: "Kháng sinh điều trị nhiễm khuẩn",
      category: "prescribed",
      unitId: "vien",
      unitName: "Viên",
      importPrice: 2000,
      sellPrice: 4000,
      minStockLevel: 500,
      imageUrl: null,
      icon: "vaccines",
      iconBg: "bg-tertiary-container",
      iconColor: "text-on-tertiary-container",
      isActive: true,
    },
    {
      id: "MED-003",
      sku: "MED-003",
      name: "Vitamin C 1000mg",
      description: "Bổ sung Vitamin C, tăng sức đề kháng",
      category: "otc",
      unitId: "vien",
      unitName: "Viên",
      importPrice: 3000,
      sellPrice: 6000,
      minStockLevel: 800,
      imageUrl: null,
      icon: "water_lux",
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
      isActive: true,
    },
    {
      id: "MED-004",
      sku: "MED-004",
      name: "Atorvastatin 20mg",
      description: "Điều trị tăng mỡ máu, phòng ngừa tim mạch",
      category: "prescribed",
      unitId: "vien",
      unitName: "Viên",
      importPrice: 8000,
      sellPrice: 15000,
      minStockLevel: 300,
      imageUrl: null,
      icon: "favorite",
      iconBg: "bg-error-container",
      iconColor: "text-error",
      isActive: true,
    },
    {
      id: "MED-005",
      sku: "MED-005",
      name: "Omeprazole 20mg",
      description: "Điều trị loét dạ dày, trào ngược acid",
      category: "prescribed",
      unitId: "vien",
      unitName: "Viên",
      importPrice: 5000,
      sellPrice: 10000,
      minStockLevel: 400,
      imageUrl: null,
      icon: "ecg",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      isActive: true,
    },
  ];

  for (const medicine of medicines) {
    batch.set(doc(db, "medicines", medicine.id), {
      ...medicine,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`  ✓ ${medicines.length} medicines`);
}

async function seedInventory() {
  console.log("Seeding inventory (WAREHOUSE)...");
  const batch = writeBatch(db);

  const warehouseStock = [
    {
      medicineId: "MED-001",
      medicineName: "Paracetamol 500mg",
      medicineSku: "MED-001",
      quantity: 50000,
      minStockLevel: 1000,
    },
    {
      medicineId: "MED-002",
      medicineName: "Amoxicillin 500mg",
      medicineSku: "MED-002",
      quantity: 20000,
      minStockLevel: 500,
    },
    {
      medicineId: "MED-003",
      medicineName: "Vitamin C 1000mg",
      medicineSku: "MED-003",
      quantity: 30000,
      minStockLevel: 800,
    },
    {
      medicineId: "MED-004",
      medicineName: "Atorvastatin 20mg",
      medicineSku: "MED-004",
      quantity: 10000,
      minStockLevel: 300,
    },
    {
      medicineId: "MED-005",
      medicineName: "Omeprazole 20mg",
      medicineSku: "MED-005",
      quantity: 15000,
      minStockLevel: 400,
    },
  ];

  for (const item of warehouseStock) {
    const id = `WAREHOUSE_${item.medicineId}`;
    batch.set(doc(db, "inventory", id), {
      id,
      ...item,
      locationId: "WAREHOUSE",
      locationType: "warehouse",
      updatedAt: serverTimestamp(),
    });
  }

  // Chi nhánh CN001 có sẵn một ít hàng
  const branchStock = [
    {
      medicineId: "MED-001",
      medicineName: "Paracetamol 500mg",
      medicineSku: "MED-001",
      quantity: 500,
      minStockLevel: 0,
    },
    {
      medicineId: "MED-003",
      medicineName: "Vitamin C 1000mg",
      medicineSku: "MED-003",
      quantity: 200,
      minStockLevel: 0,
    },
  ];

  for (const item of branchStock) {
    const id = `CN001_${item.medicineId}`;
    batch.set(doc(db, "inventory", id), {
      id,
      ...item,
      locationId: "CN001",
      locationType: "branch",
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(
    `  ✓ ${warehouseStock.length + branchStock.length} inventory records`,
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔥 Firebase Seed Script");
  console.log(`   Project: ${process.env.VITE_FIREBASE_PROJECT_ID}\n`);

  try {
    await seedUnits();
    await seedBranches();
    await seedSuppliers();
    await seedMedicines();
    await seedInventory();

    console.log("\n✅ Seed hoàn thành!");
    console.log("\n📌 Bước tiếp theo:");
    console.log(
      "   1. Vào Firebase Console → Firestore → tạo tài khoản admin đầu tiên thủ công",
    );
    console.log("   2. Deploy rules: firebase deploy --only firestore:rules");
    console.log(
      "   3. Deploy indexes: firebase deploy --only firestore:indexes",
    );
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed thất bại:", err);
    process.exit(1);
  }
}

main();
