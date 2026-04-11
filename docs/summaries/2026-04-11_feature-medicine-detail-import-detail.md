# Feature: Medicine Detail Modal + Import Order Detail with Real Data

**Ngày:** 2026-04-11  
**Loại:** Feature

---

## Tóm tắt

Implement trang xem chi tiết từng loại thuốc (`MedicineDetailModal`) khi click icon eye trong bảng Kho thuốc. Đồng thời fix `ImportDetailModal` — thay toàn bộ mock data bằng fetch thực từ Firestore với loading/error state. Thêm `getImportOrder(id)` vào service.

---

## Files đã tạo / chỉnh sửa

| File                                               | Hành động | Mô tả                                                                  |
| -------------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| `src/components/inventory/MedicineDetailModal.tsx` | Tạo mới   | Modal chi tiết thuốc: stat cards, stock bar, badges, action buttons    |
| `src/components/inventory/ImportDetailModal.tsx`   | Cập nhật  | Xoá mock data; fetch Firestore theo `importId`; loading/error state    |
| `src/components/inventory/InventoryTable.tsx`      | Cập nhật  | Import và wire `MedicineDetailModal`; eye icon mở detail thay vì batch |
| `src/services/inventory.ts`                        | Cập nhật  | Thêm `getImportOrder(id)` + import `getDoc` từ Firestore               |

---

## Giải thích kỹ thuật

### MedicineDetailModal

- Nhận `medicine: MedicineDoc | null` và `inventoryDoc: InventoryDoc | null` làm props — dùng lại data đã fetch trong `InventoryTable`, tránh Firestore call thừa.
- Hiển thị: icon + badges (category, active status, stock status), 4 stat cards (importPrice, sellPrice, stock, minLevel), stock progress bar, lãi gộp %, action buttons (Xem lô hàng / Chỉnh sửa / Đóng).
- "Xem lô hàng" và "Chỉnh sửa" callback lên `InventoryTable` để mở `BatchHistoryModal` / `AddMedicineModal` tương ứng.

### ImportDetailModal — real data

- `useEffect([open, importId])` → gọi `getImportOrder(importId)` mỗi khi modal mở với ID mới.
- `cancelled` ref pattern để tránh state update sau unmount.
- Luồng: loading spinner → error banner → `null` (not found) → full content.
- Hiển thị: summary bento (code, date, supplier, creator), totals row (subtotal/VAT/total), items table với lot number, notes section.

### InventoryTable wiring

- `detailMed` state mới — khi click eye icon, set `detailMed = med`.
- `MedicineDetailModal` nhận `inventoryDoc = inventory.find(i => i.medicineId === detailMed.id)`.
- `onEdit` callback: `setEditMed(detailMed); setDetailMed(null)` — chuyển từ detail sang edit modal.
- `onViewBatches` callback: `setBatchMed(detailMed); setDetailMed(null)` — mở `BatchHistoryModal`.

---

## Cách dùng

```tsx
// Click eye icon trên row trong InventoryTable → MedicineDetailModal mở
// Modal hiện: tên, SKU, category, status, prices, stock level, actions

// Click "Xem lô hàng" trong MedicineDetailModal → BatchHistoryModal mở
// Click "Chỉnh sửa" trong MedicineDetailModal → AddMedicineModal (edit mode) mở

// Click eye icon trong InventoryImportTab → ImportDetailModal mở
// → Fetch Firestore doc import_orders/{id} → hiện items, totals, supplier info
```

---

## Bước tiếp theo (nếu có)

- [ ] Thêm `expiryDate` formatting trong ImportDetailModal items table
- [ ] Xem xét cache medicine detail (tránh fetch lại nếu đã load)
- [ ] Implement in phiếu / xuất Excel thực (hiện tại chỉ là nút placeholder)
