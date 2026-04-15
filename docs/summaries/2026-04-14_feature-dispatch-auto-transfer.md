# Dispatch Auto Transfer — Xuất kho tự động chuyển hàng sang chi nhánh

**Ngày:** 2026-04-14  
**Loại:** Feature

---

## Tóm tắt

Khi quản lý kho nhấn "Xác nhận xuất kho", hệ thống tự động trừ tồn kho + batch ở kho tổng và cộng inventory + tạo batch mới tại chi nhánh trong cùng một transaction. Không còn bước trung gian `shipping` — đơn chuyển thẳng sang `received`.

---

## Files đã tạo / chỉnh sửa

| File                                         | Hành động | Mô tả                                                                                                                  |
| -------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/services/inventory.ts`                  | Cập nhật  | `confirmDispatchShipped` giờ trừ kho tổng + cộng chi nhánh (inventory + batch) trong 1 writeBatch, status → `received` |
| `src/components/dispatches/DispatchList.tsx` | Cập nhật  | Cập nhật optimistic UI: status → `received` thay vì `shipping` sau khi confirm                                         |

---

## Giải thích kỹ thuật

### Trước đây (2 bước)

1. Quản lý nhấn "Xác nhận xuất kho" → `confirmDispatchShipped`: trừ kho tổng, status → `shipping`
2. Chi nhánh nhấn "Xác nhận nhận hàng" → `confirmDispatchReceived`: cộng chi nhánh, status → `received`

### Sau thay đổi (1 bước)

1. Quản lý nhấn "Xác nhận xuất kho" → `confirmDispatchShipped` làm tất cả:
   - Trừ inventory kho tổng (`WAREHOUSE_{medicineId}`)
   - Trừ batch quantity ở kho tổng
   - Tạo/cộng inventory chi nhánh (`{branchId}_{medicineId}`)
   - Tạo batch mới tại chi nhánh (clone từ batch gốc, `parentBatchId` trỏ về batch warehouse)
   - Status → `received`, ghi cả `shippedAt` + `receivedAt`

Toàn bộ thao tác nằm trong **1 Firestore `writeBatch`** — đảm bảo atomic (hoặc tất cả thành công, hoặc không thay đổi gì).

### Tại sao pre-read branch inventory?

`writeBatch` không hỗ trợ `increment` cho document chưa tồn tại. Nên cần `getDoc` trước để quyết định dùng `wb.update` (nếu đã có) hay `wb.set` (nếu chưa có).

---

## Cách dùng

Quản lý kho tạo lệnh xuất kho → nhấn **"Xác nhận xuất kho"** → đơn hiển thị trạng thái **Hoàn thành** → chi nhánh tự động có hàng trong kho và lô hàng trên POS.

---

## Bước tiếp theo (nếu có)

- [ ] Thêm stock_movement records (audit trail) khi dispatch confirmed
- [ ] Xóa hoặc deprecate `confirmDispatchReceived` nếu không còn dùng
