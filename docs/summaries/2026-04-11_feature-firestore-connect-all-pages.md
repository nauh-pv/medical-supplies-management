# Kết nối Firestore toàn bộ trang + Server-side Pagination + Edit Medicine

**Ngày:** 2026-04-11  
**Loại:** Feature

---

## Tóm tắt

Kết nối toàn bộ các tính năng còn mock data với Firestore thực, bao gồm: hiển thị thông tin user trên TopBar, chỉnh sửa thuốc, server-side pagination, tab quản lý nhập kho, form yêu cầu nhập hàng, và POS bán hàng.

---

## Files đã tạo / chỉnh sửa

| File                                              | Hành động | Mô tả                                                                                                                                           |
| ------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/contexts/UserContext.tsx`                    | Tạo mới   | React context cung cấp `UserDoc` cho toàn bộ component tree                                                                                     |
| `src/services/inventory.ts`                       | Cập nhật  | Thêm `getMedicinesPage` (cursor pagination), `getSuppliers`, `getImportOrders`, `createImportOrder`, `getImportRequests`, `createImportRequest` |
| `src/services/pos.ts`                             | Tạo mới   | `createPosTransaction` (runTransaction giảm tồn kho + lưu daily_stats), `getPosTransactions`                                                    |
| `src/App.tsx`                                     | Cập nhật  | Bọc toàn bộ app với `UserContext.Provider`, truyền `userDoc` xuống `TopBar`                                                                     |
| `src/components/layout/TopBar.tsx`                | Cập nhật  | Nhận `userDoc` prop, hiển thị tên thật và role từ Firestore thay vì hardcode                                                                    |
| `src/components/inventory/AddMedicineModal.tsx`   | Cập nhật  | Thêm prop `medicine?: MedicineDoc` — khi có thì chuyển sang edit mode, prefill form và gọi `updateMedicine`                                     |
| `src/components/inventory/InventoryTable.tsx`     | Cập nhật  | Server-side pagination dùng Firestore cursor; khi search thì fetch all và paginate client-side; wire nút Edit                                   |
| `src/components/inventory/InventoryImportTab.tsx` | Cập nhật  | Xóa mock data, fetch từ `import_orders`, loading state, search, pagination thực                                                                 |
| `src/components/imports/CreateImportModal.tsx`    | Cập nhật  | Thêm `onSuccess` prop, wire vào nút xác nhận                                                                                                    |
| `src/components/imports/DrugRequestRow.tsx`       | Cập nhật  | Thêm `medicineId`, `medicineSku`, `unitId`, `estimatedPrice` vào `DrugRow`; thêm `onSelectMedicine` callback                                    |
| `src/components/imports/CreateRequestForm.tsx`    | Cập nhật  | Load thuốc từ Firestore, wire nút Gửi tới `createImportRequest`, tính tổng giá trị thực                                                         |
| `src/components/pos/ProductGrid.tsx`              | Cập nhật  | Fetch từ `medicines` + `inventory` dựa trên `locationId` của user, hiển thị icon/màu thật                                                       |
| `src/components/pos/OrderSummary.tsx`             | Cập nhật  | Thêm payment method selector, discount input, `onCheckout` callback                                                                             |
| `src/pages/POS.tsx`                               | Cập nhật  | Wire checkout gọi `createPosTransaction`, truyền `userDoc` thông qua `useUserContext`                                                           |

---

## Giải thích kỹ thuật

### UserContext

- Tạo `UserContext` bao ngoài toàn bộ app (chỉ khi đã đăng nhập) để bất kỳ component nào cũng có thể gọi `useUserContext()` mà không cần prop drilling.
- Dùng cho: TopBar (tên/role hiển thị), ProductGrid (locationId branch), CreateRequestForm (branchId, uid), POS checkout.

### Server-side pagination (InventoryTable)

- `getMedicinesPage(locationId, cursorDoc?)` — dùng `limit(10+1)` để biết có trang tiếp không.
- Lưu lịch sử cursor vào `useRef<DocumentSnapshot[]>` (index = page - 1). Đi về page trước sẽ dùng cursor đã cache.
- Khi bật search: tự động fetch ALL medicines và paginate client-side (Firestore không support full-text search).

### Edit medicine modal

- `AddMedicineModal` nhận prop tùy chọn `medicine?: MedicineDoc`. Khi có, modal prefill form, đổi title thành "Chỉnh sửa thuốc", và submit gọi `updateMedicine` thay vì `addMedicine`.

### createImportOrder (import_orders)

- Dùng `writeBatch` để tạo `import_orders` document và các `batches` document cùng lúc.
- Sau đó dùng `increment(qty)` để tăng tồn kho WAREHOUSE cho từng sản phẩm (atomic, không cần đọc current value).

### createPosTransaction (pos_transactions)

- Dùng `runTransaction` để:
  1. Giảm inventory tại branch.
  2. Lưu `pos_transactions` document.
  3. Update hoặc tạo `daily_stats/{YYYY-MM-DD}` với `increment` để aggregation nhanh.

---

## Cách dùng

```tsx
// Lấy thông tin user trong bất kỳ component nào
import { useUserContext } from "@/contexts/UserContext";
const userDoc = useUserContext();

// Edit medicine — truyền medicine prop
<AddMedicineModal
  open={!!editMed}
  medicine={editMed}
  onClose={() => setEditMed(null)}
  onSuccess={() => { setEditMed(null); refetch(); }}
/>

// Tạo yêu cầu nhập hàng
await createImportRequest({ branchId, branchName, createdBy, items, priority, notes });

// POS thanh toán
await createPosTransaction({ branchId, items, paymentMethod, discount, ... });
```

---

## Bước tiếp theo (nếu có)

- [ ] Wire `CreateImportModal` (tab Kho) để thực sự lưu vào Firestore qua `createImportOrder`
- [ ] Kết nối `ImportList` (trang Imports) với `import_requests` từ Firestore
- [ ] Cảnh báo hết hàng (Alerts page) đọc từ `inventory` + `batches`
- [ ] Reports page đọc từ `daily_stats` subcollection
