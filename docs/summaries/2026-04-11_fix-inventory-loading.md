# Fix: Inventory Page Infinite Loading Bug

**Ngày:** 2026-04-11  
**Loại:** Feature (Bug Fix)

---

## Tóm tắt

Trang Kho thuốc bị kẹt ở trạng thái loading mãi do Firestore query thất bại (thiếu composite index) mà không có `try/catch`, khiến `setLoading(false)` không bao giờ được gọi. Đã sửa bằng cách xoá tất cả `where()+orderBy()` composite query, lọc/sort client-side, và đơn giản hoá `InventoryTable` trở lại dùng client-side pagination với proper error handling.

---

## Files đã tạo / chỉnh sửa

| File                                          | Hành động | Mô tả                                                                                                                |
| --------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/services/inventory.ts`                   | Cập nhật  | Xoá composite index queries khỏi `getMedicines`, `getUnits`, `getMedicinesPage`, `getSuppliers`, `getImportRequests` |
| `src/components/inventory/InventoryTable.tsx` | Cập nhật  | Xoá server-side cursor pagination; thay bằng simple fetch + try/catch + client-side pagination; thêm error state UI  |

---

## Giải thích kỹ thuật

### Root Cause 1 — Firestore composite index missing

Các query dùng `where("isActive", "==", true) + orderBy("name")` yêu cầu Firestore composite index. Trên database mới tạo, index này chưa tồn tại → query trả về lỗi `FAILED_PRECONDITION`.

**Fix:** Xoá `where()` khỏi tất cả query multi-field, fetch toàn bộ collection rồi `.filter()` và `.sort()` trên client. An toàn vì dataset thuốc nhỏ (< 10k items).

### Root Cause 2 — Không có try/catch

`loadPage()` và `loadAll()` trong `InventoryTable` không wrap trong `try/catch`. Khi query Firestore ném lỗi, control flow không chạy tới `setLoading(false)` → spinner chạy mãi mãi.

**Fix:** Thay toàn bộ logic bằng `Promise.all().then().catch().finally()` pattern với `cancelled` ref để tránh state update sau khi component unmount.

### Root Cause 3 — Over-engineered server-side pagination

`InventoryTable` đã được implement cursor-based server-side pagination (`DocumentSnapshot` cursors, `useRef`, `useCallback`) — quá phức tạp cho dataset nhỏ và tạo thêm bug khi Firestore index thiếu.

**Fix:** Xoá hoàn toàn server-side pagination, dùng lại `getMedicines()` + client-side `Array.slice()` pagination đơn giản.

---

## Cách dùng

`InventoryTable` giờ fetch dữ liệu một lần khi mount và mỗi khi `refetchTrigger` thay đổi:

```tsx
// Loading state: hiển thị spinner
// Error state: hiển thị thông báo lỗi với icon
// Empty state: hiển thị "Không tìm thấy sản phẩm"
// Data: client-side search filter + Pagination component
<InventoryTable refetchTrigger={refetch} onAddClick={() => setAddOpen(true)} />
```

Search filter hoạt động trực tiếp trên dữ liệu đã load — không cần thêm Firestore call.

---

## Bước tiếp theo (nếu có)

- [ ] Tạo Firestore composite indexes khi dataset lớn cần server-side pagination thực sự
- [ ] Xem xét thêm React Query / SWR cho caching và revalidation tự động
- [ ] Kiểm tra Firestore security rules cho phép read trên collection `medicines` và `inventory`
