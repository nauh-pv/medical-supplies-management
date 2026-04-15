# Inventory Location Filter & Delete Medicine

**Ngày:** 2026-04-15  
**Loại:** Feature

---

## Tóm tắt

Thêm select chọn kho (Kho Tổng / các chi nhánh) trên trang Kho thuốc để xem tồn kho theo từng địa điểm. Thêm nút xóa thuốc ở cuối mỗi dòng trong bảng, kèm popup xác nhận trước khi xóa (soft delete — set `isActive: false`).

---

## Files đã tạo / chỉnh sửa

| File                                          | Hành động | Mô tả                                                                                                     |
| --------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `src/pages/Inventory.tsx`                     | Cập nhật  | Thêm state `locationId`, fetch branches, render select chọn kho, truyền `locationId` vào `InventoryTable` |
| `src/components/inventory/InventoryTable.tsx` | Cập nhật  | Nhận prop `locationId`, thêm nút delete, thêm Modal xác nhận xóa, query inventory/batches theo locationId |
| `src/services/inventory.ts`                   | Cập nhật  | Thêm hàm `deleteMedicine(id)` — soft delete bằng cách set `isActive: false`                               |

---

## Giải thích kỹ thuật

- **Location filter:** Select mặc định là "Kho Tổng" (`WAREHOUSE`). Danh sách chi nhánh lấy từ `getBranches()`. Khi đổi location, `InventoryTable` re-fetch `getInventory(locationId)` và `getActiveBatches(locationId)`.
- **Delete:** Soft delete (set `isActive: false`) thay vì xóa cứng để bảo toàn dữ liệu liên quan (batches, stock_movements, pos_transactions). `getMedicines()` đã filter `isActive == true` sẵn.
- **Confirmation modal:** Dùng `<Modal>` common component, hiển thị tên + SKU thuốc, 2 nút Hủy / Xóa.

---

## Cách dùng

Select chọn kho nằm giữa TabBar và InventoryTable, chỉ hiện khi tab "Kho thuốc" active. Nút xóa (icon delete) ở cuối cột Thao tác mỗi dòng.
