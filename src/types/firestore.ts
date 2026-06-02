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
// 2. medicines
// ─────────────────────────────────────────────────────────────────────────────

export type MedicineCategory = "prescribed" | "otc";
export type ServiceType = "injection" | "consultation" | "other";

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
// 3. services
// ─────────────────────────────────────────────────────────────────────────────

export interface ServiceDoc {
  id: string;
  code: string;
  name: string;
  type: ServiceType;
  price: number;
  description: string;
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
  itemType: "medicine" | "service";
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
// 12. settlements
// ─────────────────────────────────────────────────────────────────────────────

export interface SettlementDoc {
  id: string; // "{branchId}_{startDate}_{endDate}"
  branchId: string;
  branchName: string;
  startDate: string; // "YYYY-MM-DD" — ngày bắt đầu kỳ quyết toán
  endDate: string; // "YYYY-MM-DD" — ngày kết thúc kỳ quyết toán
  totalDispatched: number; // tổng trị giá hàng cấp trong kỳ (VNĐ)
  totalRevenue: number; // tổng doanh thu bán ra trong kỳ (VNĐ)
  totalProfit: number; // lợi nhuận gộp
  createdBy: string;
  createdByName: string;
  notes: string;
  createdAt: Timestamp;
}
