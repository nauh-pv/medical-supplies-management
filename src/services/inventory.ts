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
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebase";
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
  UserDoc,
  DispatchOrderDoc,
  DispatchOrderItem,
} from "@/types/firestore";

// ── Medicine Image ─────────────────────────────────────────────────────────

export async function uploadMedicineImage(
  medicineId: string,
  blob: Blob,
): Promise<string> {
  const fileRef = storageRef(storage, `medicine-images/${medicineId}.jpg`);
  await uploadBytes(fileRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(fileRef);
}

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
  name: string;
  description: string;
  category: MedicineCategory;
  unitId: string;
  unitName: string;
  imageUrl?: string | null;
}

function generateSku(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "MED-";
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function addMedicine(data: AddMedicineInput): Promise<string> {
  const ref = doc(collection(db, "medicines"));
  const sku = generateSku();

  await setDoc(ref, {
    id: ref.id,
    sku,
    name: data.name,
    description: data.description,
    category: data.category,
    unitId: data.unitId,
    unitName: data.unitName,
    importPrice: 0,
    sellPrice: 0,
    minStockLevel: 10,
    imageUrl: data.imageUrl ?? null,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Use deterministic ID so createImportOrder can find and increment this record
  const invRef = doc(db, "inventory", `WAREHOUSE_${ref.id}`);
  await setDoc(invRef, {
    id: `WAREHOUSE_${ref.id}`,
    medicineId: ref.id,
    medicineName: data.name,
    medicineSku: sku,
    locationId: "WAREHOUSE",
    locationType: "warehouse",
    quantity: 0,
    minStockLevel: 10,
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateMedicine(
  id: string,
  data: Partial<AddMedicineInput> & { imageUrl?: string | null },
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

export async function updateUnit(
  id: string,
  name: string,
  description: string,
): Promise<void> {
  await updateDoc(doc(db, "units", id), { name, description });
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

export async function getActiveBatches(
  locationId: string,
): Promise<BatchDoc[]> {
  const snap = await getDocs(
    query(
      collection(db, "batches"),
      where("locationId", "==", locationId),
      where("status", "==", "active"),
    ),
  );
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as BatchDoc)
    .filter((b) => b.quantity > 0)
    .sort((a, b) => a.medicineName.localeCompare(b.medicineName, "vi"));
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
  const vat = 0;
  const total = subtotal;

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
  const q = branchId
    ? query(
        collection(db, "import_requests"),
        where("branchId", "==", branchId),
        limit(50),
      )
    : query(collection(db, "import_requests"), limit(50));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as ImportRequestDoc)
    .sort((a, b) => {
      const ta = (a.createdAt as unknown as { seconds: number })?.seconds ?? 0;
      const tb = (b.createdAt as unknown as { seconds: number })?.seconds ?? 0;
      return tb - ta;
    });
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

// ── Branches ───────────────────────────────────────────────────────────────

export async function getBranches(): Promise<UserDoc[]> {
  const q = query(collection(db, "users"), where("role", "==", "branch"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...d.data(), uid: d.id }) as UserDoc)
    .sort((a, b) =>
      (a.branchName ?? a.displayName).localeCompare(
        b.branchName ?? b.displayName,
        "vi",
      ),
    );
}

// ── Dispatch Orders ────────────────────────────────────────────────────────

export async function getDispatchOrders(
  toLocationId?: string,
): Promise<DispatchOrderDoc[]> {
  // When filtering by toLocationId, skip orderBy to avoid composite index requirement.
  // Sorting is done client-side instead.
  const q = toLocationId
    ? query(
        collection(db, "dispatch_orders"),
        where("toLocationId", "==", toLocationId),
        limit(50),
      )
    : query(
        collection(db, "dispatch_orders"),
        orderBy("createdAt", "desc"),
        limit(50),
      );
  const snap = await getDocs(q);
  const results = snap.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as DispatchOrderDoc,
  );
  if (toLocationId) {
    results.sort((a, b) => {
      const ta = (a.createdAt as unknown as { seconds: number })?.seconds ?? 0;
      const tb = (b.createdAt as unknown as { seconds: number })?.seconds ?? 0;
      return tb - ta;
    });
  }
  return results;
}

export interface CreateDispatchInput {
  fromLocationId: string;
  fromLocationType: "warehouse" | "branch";
  toLocationId: string;
  toLocationType: "branch";
  toLocationName: string;
  createdBy: string;
  createdByName: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    medicineSku: string;
    lot: string;
    batchId: string;
    quantity: number;
    unitId: string;
    unitName: string;
    unitPrice: number;
  }>;
  notes: string;
}

export async function createDispatchOrder(
  input: CreateDispatchInput,
): Promise<string> {
  const ref = doc(collection(db, "dispatch_orders"));
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const code = `DIS-${dateTag}-${ref.id.slice(-4).toUpperCase()}`;

  const items: DispatchOrderItem[] = input.items.map((i) => ({
    medicineId: i.medicineId,
    medicineName: i.medicineName,
    medicineSku: i.medicineSku,
    lot: i.lot,
    batchId: i.batchId,
    quantity: i.quantity,
    unitId: i.unitId,
    unitName: i.unitName,
    unitPrice: i.unitPrice,
    total: i.quantity * i.unitPrice,
  }));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  await setDoc(ref, {
    id: ref.id,
    code,
    fromLocationId: input.fromLocationId,
    fromLocationType: input.fromLocationType,
    toLocationId: input.toLocationId,
    toLocationType: input.toLocationType,
    toLocationName: input.toLocationName,
    createdBy: input.createdBy,
    createdByName: input.createdByName,
    status: "pending",
    items,
    totalQty,
    subtotal,
    total: subtotal,
    notes: input.notes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    shippedAt: null,
    receivedAt: null,
  });

  return ref.id;
}

export async function updateDispatchStatus(
  orderId: string,
  status: "pending" | "shipping" | "received" | "cancelled",
): Promise<void> {
  await updateDoc(doc(db, "dispatch_orders", orderId), {
    status,
    updatedAt: serverTimestamp(),
    ...(status === "shipping" ? { shippedAt: serverTimestamp() } : {}),
    ...(status === "received" ? { receivedAt: serverTimestamp() } : {}),
  });
}

export async function approveImportRequest(
  requestId: string,
  approvedBy: string,
  approvedByName: string,
): Promise<void> {
  await updateDoc(doc(db, "import_requests", requestId), {
    status: "approved",
    approvedBy,
    approvedByName,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Branch confirms receipt of a dispatch order.
 * Updates dispatch status to "received" and increments branch inventory for each item.
 */
export async function confirmDispatchReceived(
  orderId: string,
  _confirmedBy: string,
): Promise<void> {
  const orderSnap = await getDoc(doc(db, "dispatch_orders", orderId));
  if (!orderSnap.exists()) throw new Error("Dispatch order not found");
  const order = { ...orderSnap.data(), id: orderSnap.id } as DispatchOrderDoc;

  const wb = writeBatch(db);

  // Mark dispatch as received
  wb.update(doc(db, "dispatch_orders", orderId), {
    status: "received",
    receivedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Increase inventory at target branch for each item
  for (const item of order.items) {
    const invId = `${order.toLocationId}_${item.medicineId}`;
    const invRef = doc(db, "inventory", invId);
    const invSnap = await getDoc(invRef);
    if (invSnap.exists()) {
      wb.update(invRef, {
        quantity: increment(item.quantity),
        updatedAt: serverTimestamp(),
      });
    } else {
      wb.set(invRef, {
        id: invId,
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        medicineSku: item.medicineSku,
        locationId: order.toLocationId,
        locationType: "branch",
        quantity: item.quantity,
        minStockLevel: 10,
        updatedAt: serverTimestamp(),
      });
    }
  }

  await wb.commit();
}

/**
 * Branch fulfills an approved import request.
 * Marks request as "fulfilled" and increments branch inventory for each item.
 */
export async function confirmImportRequestFulfilled(
  requestId: string,
  branchId: string,
): Promise<void> {
  const reqSnap = await getDoc(doc(db, "import_requests", requestId));
  if (!reqSnap.exists()) throw new Error("Import request not found");
  const req = { ...reqSnap.data(), id: reqSnap.id } as ImportRequestDoc;

  const wb = writeBatch(db);

  wb.update(doc(db, "import_requests", requestId), {
    status: "fulfilled",
    updatedAt: serverTimestamp(),
  });

  for (const item of req.items) {
    const invId = `${branchId}_${item.medicineId}`;
    const invRef = doc(db, "inventory", invId);
    const invSnap = await getDoc(invRef);
    if (invSnap.exists()) {
      wb.update(invRef, {
        quantity: increment(item.quantity),
        updatedAt: serverTimestamp(),
      });
    } else {
      wb.set(invRef, {
        id: invId,
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        medicineSku: item.medicineSku,
        locationId: branchId,
        locationType: "branch",
        quantity: item.quantity,
        minStockLevel: 10,
        updatedAt: serverTimestamp(),
      });
    }
  }

  await wb.commit();
}

/**
 * Manager confirms a dispatch order is shipped out of warehouse.
 * Marks status as "shipping" and decrements warehouse inventory for each item.
 */
export async function confirmDispatchShipped(orderId: string): Promise<void> {
  const orderSnap = await getDoc(doc(db, "dispatch_orders", orderId));
  if (!orderSnap.exists()) throw new Error("Dispatch order not found");
  const order = { ...orderSnap.data(), id: orderSnap.id } as DispatchOrderDoc;

  const wb = writeBatch(db);

  wb.update(doc(db, "dispatch_orders", orderId), {
    status: "shipping",
    shippedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  for (const item of order.items) {
    const invId = `${order.fromLocationId}_${item.medicineId}`;
    const invRef = doc(db, "inventory", invId);
    wb.update(invRef, {
      quantity: increment(-item.quantity),
      updatedAt: serverTimestamp(),
    });

    // Also deduct from the specific batch lot
    if (item.batchId) {
      wb.update(doc(db, "batches", item.batchId), {
        quantity: increment(-item.quantity),
        updatedAt: serverTimestamp(),
      });
    }
  }

  await wb.commit();
}
