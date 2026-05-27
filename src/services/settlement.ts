import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  SettlementDoc,
  DispatchOrderDoc,
  PosTransactionDoc,
} from "@/types/firestore";

// ── Settlement ─────────────────────────────────────────────────────────────

/** Compose document ID: deterministic per branch+dateRange so no duplicates. */
function settlementId(
  branchId: string,
  startDate: string,
  endDate: string,
): string {
  return `${branchId}_${startDate}_${endDate}`;
}

export async function getSettlement(
  branchId: string,
  startDate: string,
  endDate: string,
): Promise<SettlementDoc | null> {
  const snap = await getDoc(
    doc(db, "settlements", settlementId(branchId, startDate, endDate)),
  );
  return snap.exists()
    ? ({ ...snap.data(), id: snap.id } as SettlementDoc)
    : null;
}

export async function getSettlementsByBranch(
  branchId: string,
): Promise<SettlementDoc[]> {
  const q = query(
    collection(db, "settlements"),
    where("branchId", "==", branchId),
    orderBy("startDate", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as SettlementDoc);
}

export interface CreateSettlementInput {
  branchId: string;
  branchName: string;
  startDate: string;
  endDate: string;
  totalDispatched: number;
  totalRevenue: number;
  totalProfit: number;
  createdBy: string;
  createdByName: string;
  notes: string;
}

export async function createSettlement(
  input: CreateSettlementInput,
): Promise<void> {
  const id = settlementId(input.branchId, input.startDate, input.endDate);
  const ref = doc(db, "settlements", id);
  await setDoc(ref, {
    id,
    ...input,
    createdAt: serverTimestamp(),
  });
}

// ── Settlement Data Queries ────────────────────────────────────────────────

function tsSeconds(ts: unknown): number {
  return (ts as { seconds?: number })?.seconds ?? 0;
}

function dateRangeBounds(
  startDate: string,
  endDate: string,
): { start: number; end: number } {
  const start = new Date(startDate + "T00:00:00").getTime() / 1000;
  // endDate is inclusive — set end to start of next day
  const end = new Date(endDate + "T23:59:59").getTime() / 1000 + 1;
  return { start, end };
}

/** Get dispatch orders for a branch in a date range (status: received). */
export async function getDispatchesForSettlement(
  branchId: string,
  startDate: string,
  endDate: string,
): Promise<DispatchOrderDoc[]> {
  const { start, end } = dateRangeBounds(startDate, endDate);
  const q = query(
    collection(db, "dispatch_orders"),
    where("toLocationId", "==", branchId),
    where("status", "==", "received"),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as DispatchOrderDoc)
    .filter((d) => {
      const secs = tsSeconds(d.receivedAt ?? d.createdAt);
      return secs >= start && secs < end;
    });
}

/** Get POS transactions for a branch in a date range. */
export async function getPosForSettlement(
  branchId: string,
  startDate: string,
  endDate: string,
): Promise<PosTransactionDoc[]> {
  const { start, end } = dateRangeBounds(startDate, endDate);
  const q = query(
    collection(db, "pos_transactions"),
    where("branchId", "==", branchId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as PosTransactionDoc)
    .filter((d) => {
      const secs = tsSeconds(d.createdAt);
      return secs >= start && secs < end;
    });
}

/** Calculate settlement summary from dispatches + POS transactions. */
export function calcSettlementSummary(
  dispatches: DispatchOrderDoc[],
  posTxs: PosTransactionDoc[],
): { totalDispatched: number; totalRevenue: number; totalProfit: number } {
  const totalDispatched = dispatches.reduce(
    (s, d) => s + (d.total ?? d.subtotal ?? 0),
    0,
  );
  const totalRevenue = posTxs.reduce((s, tx) => s + tx.total, 0);
  const totalProfit = posTxs.reduce(
    (s, tx) =>
      s +
      tx.items.reduce(
        (is, item) => is + (item.unitPrice - item.importPrice) * item.quantity,
        0,
      ),
    0,
  );
  return { totalDispatched, totalRevenue, totalProfit };
}
