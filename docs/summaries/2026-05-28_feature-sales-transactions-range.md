# Báo cáo giao dịch theo khoảng ngày

**Ngày:** 2026-05-28  
**Loại:** Feature

---

## Tóm tắt

Đã chuyển trang SalesTransactions sang bộ lọc cơ sở + khoảng ngày, mặc định là 30 ngày gần nhất. Tổng kho được đưa vào danh sách cơ sở, và bảng giao dịch giờ lọc theo khoảng từ ngày đến ngày thay vì theo tháng.

---

## Files đã tạo / chỉnh sửa

| File                                               | Hành động | Mô tả                                                                                                              |
| -------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/pages/SalesTransactions.tsx`                  | Cập nhật  | Đổi bộ lọc tháng sang khoảng ngày, thêm Tổng kho, và hiển thị ngữ cảnh kỳ báo cáo trên header.                     |
| `src/components/reports/SalesFilterBar.tsx`        | Cập nhật  | Chuyển filter từ năm/tháng sang `Từ ngày` / `Đến ngày` và hỗ trợ chọn cơ sở.                                       |
| `src/components/reports/SalesTransactionTable.tsx` | Cập nhật  | Reset phân trang khi bộ lọc đổi để tránh kẹt ở trang cũ khi dữ liệu thay đổi.                                      |
| `src/services/pos.ts`                              | Cập nhật  | Bỏ giới hạn 200 bản ghi ở `getAllPosTransactions()` để trang SalesTransactions có thể lọc đầy đủ theo khoảng ngày. |

---

## Giải thích kỹ thuật

Trang SalesTransactions vốn đang lấy toàn bộ giao dịch POS và lọc client-side theo tháng. Mình đổi bộ lọc sang khoảng ngày để khớp với cách người dùng muốn xem dữ liệu, đồng thời thêm lựa chọn `WAREHOUSE` vì tổng kho cũng phát sinh bán hàng.

Việc bỏ `limit(200)` ở `getAllPosTransactions()` giúp báo cáo không bị thiếu bản ghi cũ nằm trong khoảng ngày người dùng chọn. Phần pagination của bảng được reset khi dữ liệu lọc thay đổi để trải nghiệm không bị lệch trang.

---

## Cách dùng

Vào **Báo cáo** trên trang SalesTransactions, chọn **Cơ sở**, đặt **Từ ngày** và **Đến ngày**. Mặc định hệ thống sẽ mở với 30 ngày gần nhất, gồm cả Tổng kho nếu có giao dịch trong khoảng đó.

---

## Bước tiếp theo (nếu có)

- [ ] Nếu dữ liệu POS tăng nhiều, nên thêm phân trang hoặc query theo khoảng ngày ở tầng service để tránh tải quá nhiều bản ghi.
