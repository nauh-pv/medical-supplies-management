import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  PosTransactionDoc,
  PosTransactionItem,
  PaymentMethod,
} from "@/types/firestore";

export interface CreatePosTransactionInput {
  branchId: string;
  branchName: string;
  createdBy: string;
  createdByName: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    medicineSku: string;
    unitId: string;
    unitName: string;
    unitPrice: number;
    quantity: number;
  }>;
  discount: number;
  paymentMethod: PaymentMethod;
  notes: string;
}

export async function createPosTransaction(
  input: CreatePosTransactionInput,
): Promise<string> {
  // Normalize branchId — empty string behaves like null but breaks Firestore paths
  const branchId = input.branchId || "WAREHOUSE";
  const ref = doc(collection(db, "pos_transactions"));
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const code = `POS-${dateTag}-${ref.id.slice(-4).toUpperCase()}`;

  const txItems: PosTransactionItem[] = input.items.map((i) => ({
    medicineId: i.medicineId,
    medicineName: i.medicineName,
    medicineSku: i.medicineSku,
    lot: "",
    batchId: "",
    quantity: i.quantity,
    unitId: i.unitId,
    unitName: i.unitName,
    unitPrice: i.unitPrice,
    importPrice: 0,
    total: i.quantity * i.unitPrice,
  }));

  const subtotal = txItems.reduce((s, i) => s + i.total, 0);
  const vat = 0; // VAT removed — price already includes tax
  const total = subtotal - input.discount;

  await runTransaction(db, async (tx) => {
    // ── ALL READS must come before any writes ────────────────────────────
    const invRefs = input.items.map((item) => {
      const invId = `${branchId}_${item.medicineId}`;
      return doc(db, "inventory", invId);
    });
    const invSnaps = await Promise.all(invRefs.map((r) => tx.get(r)));

    let statsSnap: Awaited<ReturnType<typeof tx.get>> | null = null;
    const isRealBranch = branchId !== "WAREHOUSE";
    const today = new Date().toISOString().slice(0, 10);
    const statsRef = isRealBranch
      ? doc(db, "branches", branchId, "daily_stats", today)
      : null;
    if (statsRef) {
      statsSnap = await tx.get(statsRef);
    }

    // ── ALL WRITES after reads ────────────────────────────────────────────
    // Decrease inventory
    invSnaps.forEach((invSnap, idx) => {
      if (invSnap.exists()) {
        const current = invSnap.data().quantity as number;
        tx.update(invRefs[idx], {
          quantity: Math.max(0, current - input.items[idx].quantity),
          updatedAt: serverTimestamp(),
        });
      }
    });

    // Save transaction
    tx.set(ref, {
      id: ref.id,
      code,
      branchId,
      branchName: input.branchName || "Kho Tổng",
      createdBy: input.createdBy,
      createdByName: input.createdByName,
      items: txItems,
      subtotal,
      vat,
      discount: input.discount,
      total,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      createdAt: serverTimestamp(),
    });

    // Update branch daily stats
    if (statsRef) {
      if (statsSnap?.exists()) {
        tx.update(statsRef, {
          revenue: increment(total),
          txCount: increment(1),
        });
      } else {
        tx.set(statsRef, {
          date: today,
          branchId,
          revenue: total,
          txCount: 1,
        });
      }
    }
  });

  return ref.id;
}

export async function getPosTransactions(
  branchId: string,
): Promise<PosTransactionDoc[]> {
  const q = query(
    collection(db, "pos_transactions"),
    where("branchId", "==", branchId),
    orderBy("createdAt", "desc"),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as PosTransactionDoc);
}
