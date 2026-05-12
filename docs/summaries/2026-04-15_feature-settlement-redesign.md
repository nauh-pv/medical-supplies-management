# Settlement UI Redesign — 12-Month Table

**Ngày:** 2026-04-15  
**Loại:** Feature

---

## Tóm tắt

Thay thế thiết kế quyết toán đơn-tháng (filter → load → confirm) bằng giao diện bảng 12 tháng, cho phép xem toàn bộ trạng thái quyết toán của một chi nhánh trong cả năm cùng lúc. Thêm sidebar entry và nút quyết toán nhanh từ trang Chi nhánh.

---

## Files đã tạo / chỉnh sửa

| File | Hành động | Mô tả |
| ---- | --------- | ----- |
| `src/components/settlement/SettlementFilterBar.tsx` | Cập nhật | Bỏ chọn tháng, thêm bộ lọc trạng thái (Tất cả / Đã QT / Chưa QT) |
| `src/components/settlement/SettlementYearTable.tsx` | Tạo mới | Bảng 12 hàng cho 12 tháng trong năm, hiển thị số liệu và nút hành động |
| `src/components/settlement/SettlementConfirmModal.tsx` | Tạo mới | Modal xác nhận quyết toán: load dispatch+POS, hiện số liệu, ghi chú, confirm |
| `src/pages/Settlement.tsx` | Viết lại | Orchestrator mỏng: FilterBar + SettlementYearTable + modals |
| `src/components/layout/Sidebar.tsx` | Cập nhật | Thêm NavId `"settlement"`, path `/settlement`, icon `receipt_long` giữa Xuất kho và Chi nhánh |
| `src/components/branches/BranchTable.tsx` | Cập nhật | Thêm nút `receipt_long` per-row → `navigate("/settlement?branchId=xxx")` |

---

## Giải thích kỹ thuật

**Data loading:**  
- Khi user chọn chi nhánh + năm + bấm Tải: gọi `getSettlementsByBranch(branchId)` một lần, filter client-side theo year → O(n) reads thay vì 12 parallel reads.
- Rows unsettled chỉ hiển thị "—", không load POS/dispatch upfront.
- Khi bấm "Quyết toán" trên một hàng → `SettlementConfirmModal` mở, useEffect load `getDispatchesForSettlement + getPosForSettlement` cho tháng đó.

**Status filter:**  
- Client-side filter trên 12 rows: `"all" | "settled" | "unsettled"`, thay đổi tức thì không cần fetch lại.

**Query param navigation:**  
- BranchTable navigate sang `/settlement?branchId=xxx`.
- Settlement.tsx dùng `useSearchParams()` để đọc `branchId` khi mount, auto-load nếu có.

**View detail:**  
- Tháng đã quyết toán: nút "Xem chi tiết" → inline `<Modal>` trong Settlement.tsx hiện số liệu từ `SettlementDoc` (không re-fetch).

---

## Cách dùng

1. Vào **Quyết toán** từ sidebar.
2. Chọn **Chi nhánh** → **Năm** → bấm **Tải dữ liệu**.
3. Bảng 12 tháng hiện ra. Tháng đã QT: badge xanh + số liệu + nút Xem. Tháng chưa QT: badge xám + "—" + nút Quyết toán.
4. Bấm **Quyết toán** trên một tháng → modal tải dữ liệu, hiện tổng hàng cấp / doanh thu / lợi nhuận → nhập ghi chú → Xác nhận.
5. Từ trang **Chi nhánh**, bấm icon `receipt_long` trên một hàng → chuyển thẳng sang /settlement với chi nhánh được chọn sẵn.

---

## Bước tiếp theo (nếu có)

- [ ] Export báo cáo quyết toán sang PDF/Excel
- [ ] Hiển thị số liệu tồn kho thực tế cho từng tháng trong bảng
