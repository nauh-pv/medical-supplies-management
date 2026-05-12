---
name: msm-api
description: Firebase service layer guide for Medical Supplies Management. Covers how to read/write Firestore, add new service functions, transaction patterns, and which service file handles which collection. Reference when working with any data/API layer.
---

# MSM – Firebase Service Layer Guide

---

## 🏗️ Service Layer Overview

```
src/services/
├── firebase.ts         # Firebase app init + db, auth, storage exports
├── auth.ts             # Firebase Auth + user document creation
├── user.ts             # User profile reads/writes (users collection)
├── inventory.ts        # medicines, inventory, batches, suppliers, units, import_orders, dispatch_orders, import_requests
├── pos.ts              # pos_transactions — create + query
├── dashboard.ts        # dashboard stats aggregation
```

### Who owns which collection?

| Collection                    | Service File         |
| ----------------------------- | -------------------- |
| `users`                       | `user.ts`, `auth.ts` |
| `medicines`                   | `inventory.ts`       |
| `inventory`                   | `inventory.ts`       |
| `batches`                     | `inventory.ts`       |
| `suppliers`                   | `inventory.ts`       |
| `units`                       | `inventory.ts`       |
| `import_orders`               | `inventory.ts`       |
| `dispatch_orders`             | `inventory.ts`       |
| `import_requests`             | `inventory.ts`       |
| `pos_transactions`            | `pos.ts`             |
| `branches/{id}/daily_stats`   | `pos.ts`             |
| `branches/{id}/monthly_stats` | `dashboard.ts`       |

---

## 📋 Standard CRUD Pattern

### Read (fetch all)

```typescript
export async function getSuppliers(): Promise<SupplierDoc[]> {
  const snap = await getDocs(collection(db, "suppliers"));
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as SupplierDoc)
    .filter((s) => s.isActive !== false)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
}
```

### Read (single document)

```typescript
export async function getMedicine(id: string): Promise<MedicineDoc | null> {
  const snap = await getDoc(doc(db, "medicines", id));
  return snap.exists()
    ? ({ ...snap.data(), id: snap.id } as MedicineDoc)
    : null;
}
```

### Read (filtered query)

```typescript
export async function getInventory(
  locationId: string,
): Promise<InventoryDoc[]> {
  const q = query(
    collection(db, "inventory"),
    where("locationId", "==", locationId),
    orderBy("medicineName", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as InventoryDoc);
}
```

### Create (auto-ID)

```typescript
export async function addSupplier(input: AddSupplierInput): Promise<string> {
  const ref = doc(collection(db, "suppliers")); // auto-ID
  await setDoc(ref, {
    id: ref.id, // ALWAYS set id = ref.id
    ...input,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
```

### Update (partial)

```typescript
export async function updateSupplier(
  id: string,
  input: Partial<AddSupplierInput>,
): Promise<void> {
  await updateDoc(doc(db, "suppliers", id), { ...input });
}
```

### Soft Delete (preferred — never hard delete master data)

```typescript
export async function deleteSupplier(id: string): Promise<void> {
  await updateDoc(doc(db, "suppliers", id), { isActive: false });
}
```

### Hard Delete (only for non-critical data like units)

```typescript
export async function deleteUnit(id: string): Promise<void> {
  await deleteDoc(doc(db, "units", id));
}
```

---

## 🔄 Transaction Pattern (Multi-Document Writes)

**Used for:** POS sales, import orders, dispatch orders — any write that touches multiple documents atomically.

```typescript
import { runTransaction } from "firebase/firestore";

await runTransaction(db, async (tx) => {
  // ⚠️ RULE: ALL reads BEFORE any writes

  // 1. READS FIRST
  const invRef = doc(db, "inventory", invId);
  const invSnap = await tx.get(invRef);

  const batchRef = doc(db, "batches", batchId);
  const batchSnap = await tx.get(batchRef);

  // 2. WRITES AFTER (based on what was read)
  if (invSnap.exists()) {
    const current = invSnap.data().quantity as number;
    tx.update(invRef, {
      quantity: Math.max(0, current - saleQty),
      updatedAt: serverTimestamp(),
    });
  }

  tx.update(batchRef, {
    quantity: increment(-saleQty),
    updatedAt: serverTimestamp(),
  });

  // 3. New document
  const newRef = doc(collection(db, "pos_transactions"));
  tx.set(newRef, { id: newRef.id, ...data, createdAt: serverTimestamp() });
});
```

**Critical rule:** All `tx.get()` calls MUST come before any `tx.set()` / `tx.update()` / `tx.delete()`. The Firebase SDK enforces this — violating it throws an error.

---

## 📦 Batch Write Pattern (Non-Atomic Multi-Write)

**Used for:** Creating multiple documents where partial failure is acceptable (e.g., creating multiple inventory records).

```typescript
import { writeBatch } from "firebase/firestore";

const batch = writeBatch(db);

for (const item of items) {
  const ref = doc(collection(db, "inventory"));
  batch.set(ref, { id: ref.id, ...item, createdAt: serverTimestamp() });
}

await batch.commit(); // Max 500 writes per batch
```

---

## ⏱️ Analytics / Stats Pattern

> **RULE: Never query `pos_transactions` for charts or aggregations.**  
> Always read from `daily_stats` or `monthly_stats` subcollections.

### Read daily stats for a date range

```typescript
const today = new Date();
const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - (6 - i));
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
});

const snapshots = await Promise.all(
  days.map((date) =>
    getDoc(doc(db, `branches/${branchId}/daily_stats/${date}`)),
  ),
);

const data = days.map((date, i) => ({
  date,
  revenue: snapshots[i].exists() ? snapshots[i].data().revenue : 0,
  txCount: snapshots[i].exists() ? snapshots[i].data().txCount : 0,
}));
```

### Update daily stats (in same transaction as POS write)

```typescript
const today = new Date().toISOString().slice(0, 10);
const statsRef = doc(db, "branches", branchId, "daily_stats", today);
const statsSnap = await tx.get(statsRef);

if (statsSnap.exists()) {
  tx.update(statsRef, { revenue: increment(total), txCount: increment(1) });
} else {
  tx.set(statsRef, { date: today, branchId, revenue: total, txCount: 1 });
}
```

---

## 🔑 Key Field Rules

| Rule                       | Detail                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `id` mirrors document ID   | Always: `id: ref.id` on create                                |
| `createdAt` / `updatedAt`  | Always: `serverTimestamp()`                                   |
| Monetary values            | `number` in VNĐ — never formatted strings                     |
| Timestamps                 | Firestore `Timestamp` — never `Date` or `string`              |
| Denormalized fields        | Copy `name`, `sku`, `unitName` etc. — never join at read time |
| `isActive` for soft delete | Suppliers, medicines — never hard delete                      |

---

## 🔠 Auto-Code Generation Pattern

```typescript
function generateSupplierCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `NCC-${suffix}`;
}

// POS transaction code (date-based)
const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const code = `POS-${dateTag}-${ref.id.slice(-4).toUpperCase()}`;

// Import order code
const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const code = `IMP-${dateTag}-${ref.id.slice(-4).toUpperCase()}`;
```

---

## 🧊 firebase.ts Exports

```typescript
import { db } from "@/services/firebase"; // Firestore instance
import { auth } from "@/services/firebase"; // Firebase Auth instance
import { storage } from "@/services/firebase"; // Firebase Storage (if used)
```

Always import `db` from `@/services/firebase`, never re-initialize Firebase.

---

## 📍 Where to Add a New Service Function

1. Find the relevant service file by collection (see table above)
2. Add the function at the end of the relevant section (sections are delimited by `// ── Feature ──` comments)
3. Export the function (all service functions are named exports)
4. Add the corresponding TypeScript interface (`AddXxxInput`, etc.) above the function

```typescript
// ── Widgets ──────────────────────────────────────────────────────────────────

export interface AddWidgetInput {
  name: string;
  type: string;
}

export async function addWidget(input: AddWidgetInput): Promise<string> {
  const ref = doc(collection(db, "widgets"));
  await setDoc(ref, { id: ref.id, ...input, createdAt: serverTimestamp() });
  return ref.id;
}
```
