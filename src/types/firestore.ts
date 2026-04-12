import type { Timestamp } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "warehouse_manager" | "branch";
export type LocationType = "warehouse" | "branch";
export type StockStatus = "active" | "expired" | "recalled";
export type DispatchStatus = "pending" | "shipping" | "received" | "cancelled";
export type ImportRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "fulfilled";
export type PaymentMethod = "cash" | "card" | "transfer";
export type RequestPriority = "urgent" | "normal" | "low";
export type MovementType =
  | "import"
  | "dispatch_out"
  | "dispatch_in"
  | "sale"
  | "adjustment"
  | "return";
export type ReferenceType =
  | "import_order"
  | "dispatch_order"
  | "pos_transaction"
  | "import_request"
  | "manual";

// ─────────────────────────────────────────────────────────────────────────────
// 1. users
// ─────────────────────────────────────────────────────────────────────────────

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: UserRole;
  branchId: string | null;
  branchName: string | null;
  branchCode: string | null;
  branchAddress: string | null;
  status: "active" | "paused";
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. branches
// ─────────────────────────────────────────────────────────────────────────────

export interface BranchDoc {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  managerId: string;
  managerName: string;
  status: "active" | "paused";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. medicines
// ─────────────────────────────────────────────────────────────────────────────

export type MedicineCategory = "prescribed" | "otc";

export interface MedicineDoc {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: MedicineCategory;
  unitId: string;
  unitName: string;
  importPrice: number;
  sellPrice: number;
  minStockLevel: number;
  imageUrl: string | null;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. inventory
// ─────────────────────────────────────────────────────────────────────────────

export interface InventoryDoc {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  locationId: string;
  locationType: LocationType;
  quantity: number;
  minStockLevel: number;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. batches
// ─────────────────────────────────────────────────────────────────────────────

export interface BatchDoc {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  lot: string;
  supplierId: string;
  supplierName: string;
  locationId: string;
  locationType: LocationType;
  quantity: number;
  initialQuantity: number;
  importPrice: number;
  importDate: Timestamp;
  expiryDate: Timestamp;
  status: StockStatus;
  importOrderId: string;
  parentBatchId: string | null;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. suppliers
// ─────────────────────────────────────────────────────────────────────────────

export interface SupplierDoc {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. units
// ─────────────────────────────────────────────────────────────────────────────

export interface UnitDoc {
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. import_orders
// ─────────────────────────────────────────────────────────────────────────────

export interface ImportOrderItem {
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  lot: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number;
  total: number;
  expiryDate: Timestamp;
}

export interface ImportOrderDoc {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  createdBy: string;
  createdByName: string;
  items: ImportOrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. dispatch_orders
// ─────────────────────────────────────────────────────────────────────────────

export interface DispatchOrderItem {
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  lot: string;
  batchId: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number;
  total: number;
}

export interface DispatchOrderDoc {
  id: string;
  code: string;
  fromLocationId: string;
  fromLocationType: LocationType;
  toLocationId: string;
  toLocationType: "branch";
  toLocationName: string;
  createdBy: string;
  createdByName: string;
  status: DispatchStatus;
  items: DispatchOrderItem[];
  totalQty: number;
  subtotal: number;
  total: number;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  shippedAt: Timestamp | null;
  receivedAt: Timestamp | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. import_requests
// ─────────────────────────────────────────────────────────────────────────────

export interface ImportRequestItem {
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  quantity: number;
  unitId: string;
  unitName: string;
  estimatedPrice: number;
  notes: string;
}

export interface ImportRequestDoc {
  id: string;
  code: string;
  branchId: string;
  branchName: string;
  createdBy: string;
  createdByName: string;
  priority: RequestPriority;
  status: ImportRequestStatus;
  items: ImportRequestItem[];
  total: number;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: Timestamp | null;
  fulfilledOrderId: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. pos_transactions
// ─────────────────────────────────────────────────────────────────────────────

export interface PosTransactionItem {
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  lot: string;
  batchId: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number;
  importPrice: number; // snapshot từ batch lúc bán — dùng để tính cost
  total: number;
}

export interface PosTransactionDoc {
  id: string;
  code: string;
  branchId: string;
  branchName: string;
  createdBy: string;
  createdByName: string;
  items: PosTransactionItem[];
  subtotal: number;
  vat: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats subcollections (branches/{branchId}/daily_stats, monthly_stats)
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyStatsDoc {
  date: string; // "YYYY-MM-DD" — document ID
  year: number;
  month: number; // 1–12
  week: number; // ISO week 1–53
  branchId: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalItems: number;
  cashRevenue: number;
  cardRevenue: number;
  transferRevenue: number;
  updatedAt: Timestamp;
}

export interface MonthlyStatsDoc {
  yearMonth: string; // "YYYY-MM" — document ID
  year: number;
  month: number; // 1–12
  quarter: number; // 1–4
  branchId: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalItems: number;
  cashRevenue: number;
  cardRevenue: number;
  transferRevenue: number;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. stock_movements
// ─────────────────────────────────────────────────────────────────────────────

export interface StockMovementDoc {
  id: string;
  type: MovementType;
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  lot: string;
  batchId: string;
  locationId: string;
  locationType: LocationType;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: ReferenceType;
  referenceId: string;
  createdBy: string;
  createdByName: string;
  notes: string;
  createdAt: Timestamp;
}
