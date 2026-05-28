# Mở quyết toán cho tổng kho

**Ngày:** 2026-05-28  
**Loại:** Feature

---

## Tóm tắt

Đã mở rộng trang quyết toán để tổng kho có thể được chọn và quyết toán giống như các chi nhánh. Bộ chọn cơ sở trong trang quyết toán giờ hiển thị cả `Tổng kho`, và các nhãn liên quan được đổi sang cách gọi chung là `cơ sở` để phản ánh đúng phạm vi.

---

## Files đã tạo / chỉnh sửa

| File | Hành động | Mô tả |
| --- | --- | --- |
| `src/pages/Settlement.tsx` | Cập nhật | Thêm lựa chọn `Tổng kho`, đổi nhãn UI sang “cơ sở”, và dùng danh sách địa điểm chung cho quyết toán. |
| `src/components/settlement/SettlementFilterBar.tsx` | Cập nhật | Cho phép nhận danh sách địa điểm quyết toán thay vì chỉ nhận chi nhánh, đồng thời đổi label sang “Cơ sở”. |
| `src/components/settlement/SettlementConfirmModal.tsx` | Cập nhật | Đổi subtitle sang cách gọi trung tính hơn để hiển thị đúng với tổng kho. |

---

## Giải thích kỹ thuật

Luồng quyết toán vốn đã hỗ trợ truy vấn theo `branchId`/`locationId` ở service, nên vấn đề nằm ở UI chỉ cho chọn các chi nhánh lấy từ `getBranches()`. Thay vì sửa sâu service, mình ghép thêm một lựa chọn tĩnh cho `WAREHOUSE` ngay tại trang quyết toán, rồi dùng danh sách địa điểm chung để hiển thị và chọn mục cần quyết toán.

Cách này giữ nguyên logic truy vấn và lưu dữ liệu hiện tại, đồng thời tránh ảnh hưởng đến các màn hình khác vốn vẫn chỉ cần danh sách chi nhánh.

---

## Cách dùng

Vào trang **Quyết toán**, chọn **Tổng kho** trong bộ lọc cơ sở rồi tải dữ liệu như bình thường. Khi mở modal xác nhận, hệ thống sẽ tính toán doanh thu, lợi nhuận và lưu kỳ quyết toán cho tổng kho giống hệt chi nhánh.

---

## Bước tiếp theo (nếu có)

- [ ] Nếu cần, thêm một nhãn riêng trong sidebar hoặc trang tổng quan để người dùng vào thẳng quyết toán tổng kho.