import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  limit,
  startAfter,
  increment,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  MedicineDoc,
  InventoryDoc,
  UnitDoc,
  MedicineCategory,
  BatchDoc,
  ImportOrderDoc,
  ImportOrderItem,
  SupplierDoc,
  ImportRequestDoc,
  ImportRequestItem,
  RequestPriority,
} from "@/types/firestore";

// ── Medicines ──────────────────────────────────────────────────────────────

export async function getMedicines(): Promise<MedicineDoc[]> {
  // No orderBy/where combo to avoid needing a composite index
  const snap = await getDocs(collection(db, "medicines"));
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as MedicineDoc)
    .filter((m) => m.isActive)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export interface AddMedicineInput {
  sku: string;
  name: string;
  description: string;
  category: MedicineCategory;
  unitId: string;
  unitName: string;
  importPrice: number;
  sellPrice: number;
  minStockLevel: number;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export async function addMedicine(data: AddMedicineInput): Promise<string> {
  const ref = doc(collection(db, "medicines"));

  await setDoc(ref, {
    ...data,
    imageUrl: null,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Create initial inventory record at WAREHOUSE with 0 quantity
  const invRef = doc(collection(db, "inventory"));
  await setDoc(invRef, {
    medicineId: ref.id,
    medicineName: data.name,
    medicineSku: data.sku,
    locationId: "WAREHOUSE",
    locationType: "warehouse",
    quantity: 0,
    minStockLevel: data.minStockLevel,
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateMedicine(
  id: string,
  data: Partial<AddMedicineInput>,
): Promise<void> {
  await updateDoc(doc(db, "medicines", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ── Inventory ──────────────────────────────────────────────────────────────

export async function getInventory(
  locationId: string,
): Promise<InventoryDoc[]> {
  const q = query(
    collection(db, "inventory"),
    where("locationId", "==", locationId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as InventoryDoc);
}

// ── Units ──────────────────────────────────────────────────────────────────

export async function getUnits(): Promise<UnitDoc[]> {
  const snap = await getDocs(collection(db, "units"));
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as UnitDoc)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export async function addUnit(
  name: string,
  description: string,
): Promise<string> {
  const ref = doc(collection(db, "units"));
  await setDoc(ref, {
    name,
    description,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteUnit(id: string): Promise<void> {
  await deleteDoc(doc(db, "units", id));
}

// ── Paginated Medicines ────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export interface MedicinesPage {
  medicines: MedicineDoc[];
  inventory: InventoryDoc[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export async function getMedicinesPage(
  locationId: string,
  afterDoc?: DocumentSnapshot | null,
): Promise<MedicinesPage> {
  // Simple query: no composite index needed
  const q = afterDoc
    ? query(
        collection(db, "medicines"),
        orderBy("name"),
        startAfter(afterDoc),
        limit(PAGE_SIZE + 1),
      )
    : query(collection(db, "medicines"), orderBy("name"), limit(PAGE_SIZE + 1));

  const snap = await getDocs(q);
  const allDocs = snap.docs.filter((d) => d.data().isActive !== false);
  const hasMore = allDocs.length > PAGE_SIZE;
  const docs = hasMore ? allDocs.slice(0, PAGE_SIZE) : allDocs;
  const medicines = docs.map((d) => ({ ...d.data(), id: d.id }) as MedicineDoc);
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  const inv = await getInventory(locationId);

  return { medicines, inventory: inv, lastDoc, hasMore };
}

// ── Suppliers ──────────────────────────────────────────────────────────────

export async function getSuppliers(): Promise<SupplierDoc[]> {
  const snap = await getDocs(collection(db, "suppliers"));
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as SupplierDoc)
    .filter((s) => s.isActive !== false)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

// ── Import Orders ──────────────────────────────────────────────────────────

export interface CreateImportOrderInput {
  supplierId: string;
  supplierName: string;
  createdBy: string;
  createdByName: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    medicineSku: string;
    lot: string;
    quantity: number;
    unitId: string;
    unitName: string;
    unitPrice: number;
    expiryDate: Date;
  }>;
  notes: string;
}

export async function getBatchesByMedicine(
  medicineId: string,
): Promise<BatchDoc[]> {
  const snap = await getDocs(
    query(collection(db, "batches"), where("medicineId", "==", medicineId)),
  );
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as BatchDoc)
    .sort((a, b) => {
      const ta = (a.importDate as unknown as { seconds: number })?.seconds ?? 0;
      const tb = (b.importDate as unknown as { seconds: number })?.seconds ?? 0;
      return tb - ta;
    });
}

export async function getImportOrders(): Promise<ImportOrderDoc[]> {
  const snap = await getDocs(collection(db, "import_orders"));
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as ImportOrderDoc)
    .sort((a, b) => {
      const ta = (a.createdAt as unknown as { seconds: number })?.seconds ?? 0;
      const tb = (b.createdAt as unknown as { seconds: number })?.seconds ?? 0;
      return tb - ta;
    })
    .slice(0, 50);
}

export async function getImportOrder(
  id: string,
): Promise<ImportOrderDoc | null> {
  const snap = await getDoc(doc(db, "import_orders", id));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as ImportOrderDoc;
}

export async function createImportOrder(
  input: CreateImportOrderInput,
): Promise<string> {
  const batch = writeBatch(db);
  const orderRef = doc(collection(db, "import_orders"));

  // Generate shared code: DDMMYYYY-XXXX (used as both order code and default lot)
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  const code = `${dd}${mm}${yyyy}-${rand}`;

  const subtotal = input.items.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0,
  );
  const vat = Math.round(subtotal * 0.08);
  const total = subtotal + vat;

  const orderItems: ImportOrderItem[] = input.items.map((item) => ({
    medicineId: item.medicineId,
    medicineName: item.medicineName,
    medicineSku: item.medicineSku,
    lot: item.lot,
    quantity: item.quantity,
    unitId: item.unitId,
    unitName: item.unitName,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
    expiryDate: {
      seconds: Math.floor(item.expiryDate.getTime() / 1000),
      nanoseconds: 0,
    } as unknown as ImportOrderItem["expiryDate"],
  }));

  batch.set(orderRef, {
    id: orderRef.id,
    code,
    supplierId: input.supplierId,
    supplierName: input.supplierName,
    createdBy: input.createdBy,
    createdByName: input.createdByName,
    items: orderItems,
    subtotal,
    vat,
    total,
    notes: input.notes,
    createdAt: serverTimestamp(),
  });

  // Create batch records
  for (const item of input.items) {
    const batchRef = doc(collection(db, "batches"));
    batch.set(batchRef, {
      id: batchRef.id,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      medicineSku: item.medicineSku,
      lot: item.lot,
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      locationId: "WAREHOUSE",
      locationType: "warehouse",
      quantity: item.quantity,
      initialQuantity: item.quantity,
      importPrice: item.unitPrice,
      importDate: serverTimestamp(),
      expiryDate: {
        seconds: Math.floor(item.expiryDate.getTime() / 1000),
        nanoseconds: 0,
      },
      status: "active",
      importOrderId: orderRef.id,
      parentBatchId: null,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();

  // Upsert inventory quantities — setDoc with merge handles docs that don't exist yet
  await Promise.all(
    input.items.map(async (item) => {
      const invId = `WAREHOUSE_${item.medicineId}`;
      const invRef = doc(db, "inventory", invId);
      const snap = await getDoc(invRef);
      if (snap.exists()) {
        await updateDoc(invRef, {
          quantity: increment(item.quantity),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(invRef, {
          id: invId,
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          medicineSku: item.medicineSku,
          locationId: "WAREHOUSE",
          locationType: "warehouse",
          quantity: item.quantity,
          minStockLevel: 10,
          updatedAt: serverTimestamp(),
        });
      }
    }),
  );

  return orderRef.id;
}

// ── Import Requests ────────────────────────────────────────────────────────

export interface CreateImportRequestInput {
  branchId: string;
  branchName: string;
  createdBy: string;
  createdByName: string;
  priority: RequestPriority;
  items: Array<{
    medicineId: string;
    medicineName: string;
    medicineSku: string;
    quantity: number;
    unitId: string;
    unitName: string;
    estimatedPrice: number;
    notes: string;
  }>;
  notes: string;
}

export async function getImportRequests(
  branchId?: string,
): Promise<ImportRequestDoc[]> {
  const snap = await getDocs(collection(db, "import_requests"));
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as ImportRequestDoc)
    .filter((r) => !branchId || r.branchId === branchId)
    .sort((a, b) => {
      const ta = (a.createdAt as unknown as { seconds: number })?.seconds ?? 0;
      const tb = (b.createdAt as unknown as { seconds: number })?.seconds ?? 0;
      return tb - ta;
    })
    .slice(0, 50);
}

export async function createImportRequest(
  input: CreateImportRequestInput,
): Promise<string> {
  const ref = doc(collection(db, "import_requests"));
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const code = `REQ-${dateTag}-${ref.id.slice(-4).toUpperCase()}`;

  const total = input.items.reduce(
    (s, i) => s + i.quantity * i.estimatedPrice,
    0,
  );

  const requestItems: ImportRequestItem[] = input.items.map((item) => ({
    medicineId: item.medicineId,
    medicineName: item.medicineName,
    medicineSku: item.medicineSku,
    quantity: item.quantity,
    unitId: item.unitId,
    unitName: item.unitName,
    estimatedPrice: item.estimatedPrice,
    notes: item.notes,
  }));

  await setDoc(ref, {
    id: ref.id,
    code,
    branchId: input.branchId,
    branchName: input.branchName,
    createdBy: input.createdBy,
    createdByName: input.createdByName,
    priority: input.priority,
    status: "pending",
    items: requestItems,
    total,
    notes: input.notes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedBy: null,
    approvedByName: null,
    approvedAt: null,
    fulfilledOrderId: null,
  });

  return ref.id;
}
