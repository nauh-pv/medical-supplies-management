# Role-based Login + Kho hàng (Inventory) − Kết nối Firestore

**Ngày:** 2025-01-27  
**Loại:** Feature

---

## Tóm tắt

Implement phân quyền login theo 2 role (`warehouse_manager` / `branch`), cập nhật Sidebar lọc nav theo role, wire logout, và kết nối toàn bộ trang Kho hàng (Inventory) — bao gồm danh sách thuốc, thêm thuốc mới, và quản lý đơn vị tính — với Firestore thực thay cho mock data.

---

## Files đã tạo / chỉnh sửa

| File | Hành động | Mô tả |
| ---- | --------- | ----- |
| `src/services/user.ts` | Tạo mới | `getUserProfile(uid)` — đọc `/users/{uid}` từ Firestore |
| `src/services/inventory.ts` | Tạo mới | CRUD cho medicines, inventory, units: `getMedicines`, `addMedicine`, `updateMedicine`, `getInventory`, `getUnits`, `addUnit`, `deleteUnit` |
| `src/App.tsx` | Cập nhật | Thêm `userDoc` state, fetch profile sau khi auth resolve, truyền `role` và `onLogout` xuống Sidebar |
| `src/components/layout/Sidebar.tsx` | Cập nhật | Nhận `role: UserRole` và `onLogout` props; lọc nav items theo role; wire logout button |
| `src/components/inventory/InventoryTable.tsx` | Cập nhật | Xóa mock data, fetch từ Firestore (`getMedicines` + `getInventory("WAREHOUSE")`), loading state, search realtime, pagination thực, hiển thị giá VNĐ format |
| `src/components/inventory/AddMedicineModal.tsx` | Cập nhật | Form đầy đủ (SKU, tên, danh mục, đơn vị từ Firestore, giá nhập/bán, tồn kho tối thiểu, biểu tượng), ghi vào Firestore, `onSuccess` callback để trigger refetch |
| `src/components/units/UnitTable.tsx` | Cập nhật | Xóa mock data, fetch từ Firestore, add/delete unit ghi DB thực, loading state |
| `src/pages/Inventory.tsx` | Cập nhật | Thêm `refetchTrigger` state để force reload InventoryTable sau khi thêm thuốc mới |

---

## Giải thích kỹ thuật

### Role-based routing
- Sau khi `onAuthStateChanged` trả về user, App.tsx gọi `getUserProfile(uid)` để lấy `UserDoc` (chứa `role`) từ Firestore.
- `userDoc` được đặt trong state; trong khi chờ, `role` fallback về `"branch"` (an toàn hơn).
- Sidebar nhận `role` và dùng constant `BRANCH_NAV_IDS` để lọc: branch chỉ thấy dashboard, pos, imports, alerts, settings.

### Inventory data flow
- `InventoryTable` tự fetch theo pattern: `getMedicines()` + `getInventory("WAREHOUSE")` chạy song song (`Promise.all`).
- Stock được tính bằng join: `inventory.find(i => i.medicineId === med.id)?.quantity ?? 0`.
- `DisplayStatus` (`in-stock` / `low-stock` / `out-of-stock`) được compute từ qty vs minStockLevel — tách biệt với `StockStatus` của Firestore (active/expired/recalled).
- `refetchTrigger` là counter tăng dần — thay đổi giá trị là dependency của `useEffect`, buộc refetch sau khi add medicine.

### AddMedicineModal
- Load units từ Firestore khi modal mở (`useEffect` on `open`).
- SKU tự sinh ngẫu nhiên (`MED-XXXXX`) nhưng user có thể sửa.
- Sau khi `addMedicine()` thành công, gọi `onSuccess()` thay vì `onClose()` để trang cha có thể trigger refetch.
- `addMedicine` service tự động tạo `InventoryDoc` mới tại WAREHOUSE với `quantity: 0`.

### UnitTable
- Dùng async `loadUnits()` helper để refresh sau add/delete.
- `handleDelete` là async, await deleteUnit trước khi reload.

---

## Cách dùng

```tsx
// Role-based nav — tự động từ Firestore sau login
// warehouse_manager thấy tất cả nav items
// branch chỉ thấy: dashboard, pos, imports, alerts, settings

// Thêm thuốc mới với refetch
<AddMedicineModal
  open={addOpen}
  onClose={() => setAddOpen(false)}
  onSuccess={() => {
    setAddOpen(false);
    setRefetchTrigger((n) => n + 1); // trigger InventoryTable refetch
  }}
/>

// InventoryTable nhận refetchTrigger
<InventoryTable
  onAddClick={() => setAddOpen(true)}
  refetchTrigger={refetchTrigger}
/>
```

---

## Bước tiếp theo (nếu có)

- [ ] Thêm server-side pagination cho Inventory (Firestore cursor) khi số lượng thuốc lớn
- [ ] Implement edit medicine modal (nút edit hiện chưa có handler)
- [ ] Connect POS page với Firestore (pos_transactions với runTransaction)
- [ ] Connect Imports page với import_orders collection
- [ ] Hiển thị thông tin user (tên, role) trong TopBar / Sidebar footer
