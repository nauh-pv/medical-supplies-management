import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import type {
  PosTransactionDoc,
  UserDoc,
  BatchDoc,
  InventoryDoc,
} from "@/types/firestore";
import { getMedicines } from "./inventory";

// ── Exported types ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenueThisMonth: number;
  totalProfitThisMonth: number;
  activeBranches: number;
  totalSkus: number;
}

export interface DailyRevenue {
  day: string;
  date: string;
  revenue: number;
  highlight?: boolean;
}

export interface TopMedicine {
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  totalQty: number;
  totalRevenue: number;
}

export interface LowStockItem {
  medicineId: string;
  medicineName: string;
  current: number;
  minimum: number;
}

export interface ExpiryItem {
  name: string;
  sku: string;
  qty: string;
  daysLeft: number;
  priority: string;
}

export interface StockAlert {
  lowStock: LowStockItem[];
  expiringSoon: ExpiryItem[];
}

export interface RecentActivity {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  detail: string;
  timeLabel: string;
  timeLabelColor: string;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueByDay: DailyRevenue[];
  topMedicines: TopMedicine[];
  stockAlerts: StockAlert;
  recentActivity: RecentActivity[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

const DAY_NAMES = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

/**
 * Safely convert any Firestore timestamp variant to a JS Date.
 * Handles: Timestamp instance, plain {seconds, nanoseconds} objects (from cache),
 * numeric epoch-seconds, strings, and null/undefined.
 */
function tsToDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (typeof (ts as { toDate?: unknown }).toDate === "function")
    return (ts as { toDate: () => Date }).toDate();
  if (typeof (ts as { seconds?: number }).seconds === "number")
    return new Date((ts as { seconds: number }).seconds * 1000);
  if (typeof ts === "number") return new Date(ts * 1000);
  return null;
}

function formatTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return "Vừa xong";
  if (diff < 60) return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return `${Math.floor(diff / 1440)} ngày trước`;
}

/** Format a JS Date as LOCAL YYYY-MM-DD (no UTC shift). */
function localDateStr(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

// ── Main fetch ─────────────────────────────────────────────────────────────

export async function getDashboardData(
  locationId = "WAREHOUSE",
): Promise<DashboardData> {
  const isBranch = locationId !== "WAREHOUSE";

  // For warehouse manager: fetch ALL inventory and batches across every location.
  // For branch: fetch only that branch's data.
  const inventoryQ = isBranch
    ? query(collection(db, "inventory"), where("locationId", "==", locationId))
    : query(collection(db, "inventory"), limit(500));

  const batchQ = isBranch
    ? query(collection(db, "batches"), where("locationId", "==", locationId))
    : query(collection(db, "batches"), limit(500));

  const [txSnap, branchSnap, meds, inventorySnap, batchSnap] =
    await Promise.all([
      // No orderBy on branch query — avoids composite index requirement; sort client-side.
      // Manager uses orderBy on createdAt alone (single-field auto-index, no composite needed).
      getDocs(
        isBranch
          ? query(
              collection(db, "pos_transactions"),
              where("branchId", "==", locationId),
              limit(500),
            )
          : query(
              collection(db, "pos_transactions"),
              orderBy("createdAt", "desc"),
              limit(500),
            ),
      ),
      // Only fetch branch users for the "active branches" stat
      getDocs(query(collection(db, "users"), where("role", "==", "branch"))),
      getMedicines(),
      getDocs(inventoryQ),
      getDocs(batchQ),
    ]);

  const txDocs = txSnap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as PosTransactionDoc)
    .sort((a, b) => {
      const ta = tsToDate(a.createdAt)?.getTime() ?? 0;
      const tb = tsToDate(b.createdAt)?.getTime() ?? 0;
      return tb - ta;
    });
  const inventory = inventorySnap.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as InventoryDoc,
  );

  // ── Stats ────────────────────────────────────────────────────────────────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const txThisMonth = txDocs.filter((t) => {
    const d = tsToDate(t.createdAt);
    return d !== null && d >= startOfMonth;
  });

  const totalRevenueThisMonth = txThisMonth.reduce((s, t) => s + t.total, 0);

  // Profit = Σ (unitPrice - importPrice) × quantity for each item sold this month.
  // importPrice is snapshotted onto each PosTransactionItem at the time of sale.
  const totalProfitThisMonth = txThisMonth.reduce(
    (s, t) =>
      s +
      t.items.reduce(
        (si, item) =>
          si + (item.unitPrice - (item.importPrice ?? 0)) * item.quantity,
        0,
      ),
    0,
  );

  const activeBranches = branchSnap.docs.filter(
    (d) => (d.data() as UserDoc).status === "active",
  ).length;

  const stats: DashboardStats = {
    totalRevenueThisMonth,
    totalProfitThisMonth,
    activeBranches,
    totalSkus: meds.length,
  };

  // ── Revenue by day (last 7) ──────────────────────────────────────────────
  const revenueByDay: DailyRevenue[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Use LOCAL date string to avoid UTC-shift timezone mismatch
    const dateStr = localDateStr(d);
    const revenue = txDocs
      .filter((t) => {
        const txDate = tsToDate(t.createdAt);
        return txDate !== null && localDateStr(txDate) === dateStr;
      })
      .reduce((s, t) => s + t.total, 0);
    revenueByDay.push({
      day: DAY_NAMES[d.getDay()],
      date: dateStr,
      revenue,
      highlight: i === 0,
    });
  }

  // ── Top medicines ────────────────────────────────────────────────────────
  const medMap = new Map<string, TopMedicine>();
  for (const tx of txDocs) {
    for (const item of tx.items) {
      if (item.itemType !== "medicine") continue;
      const existing = medMap.get(item.medicineId);
      if (existing) {
        existing.totalQty += item.quantity;
        existing.totalRevenue += item.total;
      } else {
        medMap.set(item.medicineId, {
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          medicineSku: item.medicineSku,
          totalQty: item.quantity,
          totalRevenue: item.total,
        });
      }
    }
  }
  const topMedicines = Array.from(medMap.values())
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);

  console.log("check inventory:", inventory);

  // ── Stock alerts ─────────────────────────────────────────────────────────
  const lowStock: LowStockItem[] = inventory
    .filter((i) => i.quantity <= i.minStockLevel)
    .map((i) => ({
      medicineId: i.medicineId,
      medicineName: i.medicineName,
      current: i.quantity,
      minimum: i.minStockLevel,
    }));

  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon: ExpiryItem[] = batchSnap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as BatchDoc)
    .filter((b) => {
      if (b.status !== "active" || b.quantity <= 0) return false;
      const expiry = tsToDate(b.expiryDate);
      return expiry !== null && expiry <= in30Days && expiry >= now;
    })
    .sort((a, b) => {
      const aDate = tsToDate(a.expiryDate)?.getTime() ?? 0;
      const bDate = tsToDate(b.expiryDate)?.getTime() ?? 0;
      return aDate - bDate;
    })
    .slice(0, 3)
    .map((b) => {
      const expiry = tsToDate(b.expiryDate) ?? now;
      const daysLeft = Math.ceil(
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        name: b.medicineName,
        sku: b.medicineSku,
        qty: `${b.quantity.toLocaleString("vi-VN")} đơn vị`,
        daysLeft,
        priority:
          daysLeft <= 7
            ? "Ưu tiên xử lý: Cao"
            : daysLeft <= 14
              ? "Ưu tiên xử lý: Trung bình"
              : "Đề xuất điều phối",
      };
    });

  // ── Recent activity ───────────────────────────────────────────────────────
  const recentActivity: RecentActivity[] = txDocs.slice(0, 4).map((tx) => {
    const created = tsToDate(tx.createdAt) ?? new Date();
    const totalQty = tx.items.reduce((s, i) => s + i.quantity, 0);
    const firstName = tx.items[0]?.medicineName ?? "—";
    return {
      id: tx.id,
      icon: "call_made",
      iconBg: "bg-error-container text-error",
      name: firstName,
      detail: `Bán ${totalQty} đơn vị · ${tx.total.toLocaleString("vi-VN")}₫`,
      timeLabel: formatTimeAgo(created),
      timeLabelColor: "text-on-surface-variant",
    };
  });

  return {
    stats,
    revenueByDay,
    topMedicines,
    stockAlerts: { lowStock, expiringSoon },
    recentActivity,
  };
}
