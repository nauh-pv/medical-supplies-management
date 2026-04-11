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

const VAT_RATE = 0.08;

export async function createPosTransaction(
  input: CreatePosTransactionInput,
): Promise<string> {
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
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat - input.discount;

  await runTransaction(db, async (tx) => {
    // Decrease inventory at branch for each item
    for (const item of input.items) {
      const invId = `${input.branchId}_${item.medicineId}`;
      const invRef = doc(db, "inventory", invId);
      const invSnap = await tx.get(invRef);
      if (invSnap.exists()) {
        const current = invSnap.data().quantity as number;
        tx.update(invRef, {
          quantity: Math.max(0, current - item.quantity),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Save transaction
    tx.set(ref, {
      id: ref.id,
      code,
      branchId: input.branchId,
      branchName: input.branchName,
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
    const today = new Date().toISOString().slice(0, 10);
    const statsRef = doc(db, "branches", input.branchId, "daily_stats", today);
    const statsSnap = await tx.get(statsRef);
    if (statsSnap.exists()) {
      tx.update(statsRef, {
        revenue: increment(total),
        txCount: increment(1),
      });
    } else {
      tx.set(statsRef, {
        date: today,
        branchId: input.branchId,
        revenue: total,
        txCount: 1,
      });
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
