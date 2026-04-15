# Quản lý Nhà cung cấp — Tab Suppliers trên trang Kho hàng

**Ngày:** 2026-04-15  
**Loại:** Feature

---

## Tóm tắt

Thêm tab "Quản lý nhà cung cấp" vào trang Kho hàng (Inventory), nằm sau tab "Quản lý nhập kho". Tab này cho phép thêm, sửa, xóa (soft delete) nhà cung cấp dược phẩm.

---

## Files đã tạo / chỉnh sửa

| File                                         | Hành động | Mô tả                                                       |
| -------------------------------------------- | --------- | ----------------------------------------------------------- |
| `src/components/suppliers/SupplierTable.tsx` | Tạo mới   | Component bảng NCC với search, pagination, add/edit/delete  |
| `src/services/inventory.ts`                  | Cập nhật  | Thêm `addSupplier`, `updateSupplier`, `deleteSupplier`      |
| `src/pages/Inventory.tsx`                    | Cập nhật  | Thêm tab `suppliers` vào `INVENTORY_TABS` và render content |

---

## Giải thích kỹ thuật

- **Soft delete:** `deleteSupplier` set `isActive: false` thay vì xóa document, để bảo toàn reference từ `batches` và `import_orders`.
- **Pattern:** Theo đúng pattern của `UnitTable` — search + pagination client-side, modal form cho add/edit.
- **Form layout:** Modal dùng grid 2 cột cho code/name và phone/email, textarea cho address.

---

## Cách dùng

Mở trang "Kho hàng" → chọn tab "Quản lý nhà cung cấp" → dùng nút "Thêm NCC mới" để thêm, icon edit/delete trên mỗi dòng để sửa/xóa.

---

## Bước tiếp theo (nếu có)

- [ ] Thêm validation chi tiết (email format, phone format, unique code)
- [ ] Hiển thị số lượng đơn nhập từ mỗi NCC
