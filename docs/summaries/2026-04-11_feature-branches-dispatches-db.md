# Connect Branches & Dispatches Pages to Firestore

**Ngày:** 2026-04-11
**Loại:** Feature

---

## Tóm tắt

Kết nối trang Chi nhánh và Điều phối thuốc với Firestore thay vì dùng mock data. Thêm service function `getActiveBatches`, cập nhật các component để nhận real props, và wire up form tạo lệnh xuất kho với real branches/batches.

---

## Files đã tạo / chỉnh sửa

| File                                                | Hành động | Mô tả                                                                                                              |
| --------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/services/inventory.ts`                         | Cập nhật  | Thêm `getActiveBatches(locationId)` lấy batch active có stock > 0                                                  |
| `src/pages/Branches.tsx`                            | Cập nhật  | Thêm `useEffect + getBranches()`, pass `{branches, loading}` props                                                 |
| `src/components/branches/BranchTable.tsx`           | Cập nhật  | Xóa `mockBranches`, nhận `{branches: BranchDoc[], loading}` props, pagination động                                 |
| `src/components/branches/BranchStatCards.tsx`       | Cập nhật  | Nhận `{branches, loading}` props, tính stats động (đã làm session trước)                                           |
| `src/components/dispatches/DispatchDetailModal.tsx` | Cập nhật  | Đổi prop từ `orderId: string` sang `order: DispatchOrderDoc \| null`, hiển thị real items/status/dates             |
| `src/components/dispatches/DispatchList.tsx`        | Cập nhật  | Xóa `mockOrders`, fetch `getDispatchOrders()`, map status sang badge variants, search filter, pagination động      |
| `src/components/dispatches/CreateDispatchForm.tsx`  | Cập nhật  | Fetch real branches + WAREHOUSE batches, wire submit với `createDispatchOrder()`, validation, loading/error states |

---

## Giải thích kỹ thuật

### BranchTable

- Dùng `BranchDoc` từ `@/types/firestore` thay cho local `Branch` interface
- Loading skeleton với `animate-pulse` khi `loading === true`
- Pagination động: `Math.ceil(branches.length / PAGE_SIZE)`

### DispatchDetailModal

- Prop thay đổi từ `orderId: string` sang `order: DispatchOrderDoc | null` để tránh refetch và đồng bộ với data đã có ở `DispatchList`
- `formatTs(ts: unknown)` helper để render Firestore Timestamp
- Map `order.status` → `STATUS_CONFIG` để hiển thị đúng badge variant
- Timeline hiển thị `createdAt` và `shippedAt` (có/không)

### DispatchList

- State: `orders`, `loading`, `search`, `selectedOrder` (DispatchOrderDoc | null), `page`
- Fetch bằng `getDispatchOrders()` (không filter — warehouse_manager xem tất cả)
- Search client-side theo `code` và `toLocationName`
- Click "Xem chi tiết" → `setSelectedOrder(order)` → pass full order object xuống modal

### CreateDispatchForm

- `DispatchRow extends ProductRow` — thêm các field cần cho submission: `batchId`, `medicineId`, `unitId`, `unitPrice`
- Fetch `getBranches()` và `getActiveBatches("WAREHOUSE")` song song khi mount
- Dropdown "Add" — chọn batch → thêm row (ngăn duplicate batch)
- Validation: phải chọn chi nhánh, phải có ít nhất 1 sản phẩm, qty ≤ stock
- Submit → `createDispatchOrder()` → `onCancel()` (chuyển về tab lịch sử)

### getActiveBatches (mới)

```ts
export async function getActiveBatches(locationId: string): Promise<BatchDoc[]>;
// Query: batches where locationId == x AND status == "active"
// Filter: quantity > 0
// Sort: by medicineName vi locale
```

---

## Cách dùng

```tsx
// Branches page — tự fetch
<Branches /> // → getBranches() → pass to BranchStatCards + BranchTable

// Dispatches page — DispatchList tự fetch, form tự fetch
<DispatchList />
<CreateDispatchForm onCancel={() => setTab("history")} />

// DispatchDetailModal — nhận order object từ DispatchList
<DispatchDetailModal open={!!selectedOrder} onClose={...} order={selectedOrder} />
```

---

## Bước tiếp theo (nếu có)

- [ ] Thêm nút "Thêm chi nhánh mới" trong BranchTable với modal
- [ ] Thêm "Xác nhận nhận hàng" trong DispatchDetailModal (gọi `updateDispatchStatus`)
- [ ] Real-time listener (`onSnapshot`) cho DispatchList để tự cập nhật khi có lệnh xuất mới
