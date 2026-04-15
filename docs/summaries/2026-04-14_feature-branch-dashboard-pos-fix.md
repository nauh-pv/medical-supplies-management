# Branch Dashboard Restriction + POS Batch Fix

**Ngày:** 2026-04-14  
**Loại:** Feature

---

## Tóm tắt

1. Giới hạn Dashboard cho chi nhánh: chỉ hiển thị Doanh thu tháng này, Lợi nhuận tháng này, và Xu hướng Doanh thu (chỉ tuần).
2. Sửa lỗi POS chi nhánh không hiển thị lô hàng — nguyên nhân do `confirmDispatchReceived` chỉ tạo inventory mà không tạo batch record cho chi nhánh.

---

## Files đã tạo / chỉnh sửa

| File                                          | Hành động | Mô tả                                                                       |
| --------------------------------------------- | --------- | --------------------------------------------------------------------------- |
| `src/pages/Dashboard.tsx`                     | Cập nhật  | Ẩn AlertsSection, TopSellingTable, StockDynamicsPanel cho branch; đổi title |
| `src/components/dashboard/StatSummaryRow.tsx` | Cập nhật  | Ẩn StatCard "Tổng mã hàng (SKU)" cho branch, grid 2 cột                     |
| `src/components/dashboard/RevenueChart.tsx`   | Cập nhật  | Thêm prop `weekOnly` để ẩn period toggle cho branch                         |
| `src/services/inventory.ts`                   | Cập nhật  | `confirmDispatchReceived` tạo batch documents cho chi nhánh khi nhận hàng   |

---

## Giải thích kỹ thuật

### Dashboard cho chi nhánh

- Dùng `isBranch = userDoc?.role === "branch"` để conditional render.
- StatSummaryRow chỉ hiển thị 2 card (Doanh thu, Lợi nhuận) thay vì 4.
- RevenueChart nhận `weekOnly` prop — khi `true`, ẩn period toggle (Tuần/Tháng/Quý/Năm).

### POS batch bug

- **Root cause:** `confirmDispatchReceived` chỉ tạo/update inventory record cho chi nhánh nhưng KHÔNG tạo batch record. `getActiveBatches(locationId)` query batches theo `locationId`, nên chi nhánh không có batch nào.
- **Fix:** Khi confirm nhận hàng, đọc batch gốc từ kho tổng, tạo batch mới tại chi nhánh với `parentBatchId` trỏ về batch gốc. Batch mới kế thừa `supplierId`, `importPrice`, `expiryDate`, `importDate` từ batch gốc.

---

## Cách dùng

- Chi nhánh đăng nhập → Sidebar chỉ hiện Tổng quan + Bán hàng (đã có sẵn).
- Dashboard chi nhánh hiển thị 2 StatCard + Revenue Chart (tuần).
- Khi kho tổng xuất hàng → chi nhánh xác nhận nhận → batch được tạo tại chi nhánh → POS hiển thị lô hàng.

---

## Bước tiếp theo (nếu có)

- [ ] Chạy lại `confirmDispatchReceived` cho các dispatch đã received trước đây để tạo batch cho chi nhánh (nếu có dữ liệu cũ)
- [ ] Thêm stock_movement record khi confirm dispatch (audit trail)
