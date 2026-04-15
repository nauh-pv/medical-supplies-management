# Trang Danh sách hàng bán ra (Sales Transactions)

**Ngày:** 2026-04-14  
**Loại:** Feature

---

## Tóm tắt

Implement trang "Danh sách hàng bán ra" cho quản lý kho — hiển thị toàn bộ hóa đơn POS từ tất cả chi nhánh, với bộ lọc theo chi nhánh, khoảng thời gian, và tìm kiếm. Có 2 stat cards tổng doanh thu / tổng đơn hàng, bảng dữ liệu phân trang, và modal xem chi tiết hóa đơn.

---

## Files đã tạo / chỉnh sửa

| File                                               | Hành động | Mô tả                                                                |
| -------------------------------------------------- | --------- | -------------------------------------------------------------------- |
| `src/pages/SalesTransactions.tsx`                  | Tạo mới   | Page orchestrator — fetch data, filter logic, compose sub-components |
| `src/components/reports/SalesFilterBar.tsx`        | Tạo mới   | Search input + branch select + period toggle (Tuần/Tháng/Quý/Năm)    |
| `src/components/reports/SalesStatCards.tsx`        | Tạo mới   | 2 stat cards: Tổng doanh thu bán lẻ + Tổng số đơn hàng               |
| `src/components/reports/SalesTransactionTable.tsx` | Tạo mới   | Table hiển thị hóa đơn + pagination + detail modal                   |
| `src/services/pos.ts`                              | Cập nhật  | Thêm `getAllPosTransactions()` — fetch all POS tx across branches    |
| `src/components/layout/Sidebar.tsx`                | Cập nhật  | Uncomment "Báo cáo" nav item, trỏ tới `/sales-transactions`          |
| `src/App.tsx`                                      | Cập nhật  | Thêm route `/sales-transactions` → `<SalesTransactions />`           |

---

## Giải thích kỹ thuật

### Data flow

- `getAllPosTransactions()` fetch 200 đơn gần nhất (orderBy `createdAt` desc) từ `pos_transactions` collection — không filter theo branch.
- `getBranches()` lấy danh sách chi nhánh để populate select dropdown.
- Client-side filtering theo: period (week/month/quarter/year), branchId, và search text (code, branchName, total).

### Sub-components

- **SalesFilterBar**: Nhận state props từ page, render search + select + period toggle. Export `SalesPeriod` type.
- **SalesStatCards**: 2 bento-style cards với icon background decorative, nhận computed `totalRevenue` / `totalOrders`.
- **SalesTransactionTable**: Self-contained table với internal pagination (8 rows/page) và detail modal. Modal hiển thị items table + totals breakdown.

### Sidebar

- "Báo cáo" được uncomment, nav path đổi từ `/reports` → `/sales-transactions`.
- Route `/reports` vẫn hoạt động cho page Reports cũ.

---

## Cách dùng

Quản lý kho → Sidebar → **Báo cáo** → Trang "Danh sách hàng bán ra" hiển thị:

1. Bộ lọc: tìm kiếm, chọn chi nhánh, chọn khoảng thời gian
2. 2 stat cards tổng hợp (doanh thu + số đơn)
3. Bảng giao dịch với phân trang
4. Nhấn icon 👁 để xem chi tiết hóa đơn (modal)

---

## Bước tiếp theo (nếu có)

- [ ] Thêm export CSV/PDF cho danh sách hóa đơn
- [ ] Server-side pagination nếu số lượng transaction tăng lớn (>200)
- [ ] Thêm biểu đồ doanh thu theo ngày/tuần vào trang báo cáo
