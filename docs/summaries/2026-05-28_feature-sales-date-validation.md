# Sales Date Validation

**Ngày:** 2026-05-28  
**Loại:** Feature

---

## Tóm tắt

Đã thêm kiểm tra hợp lệ cho bộ lọc ngày trong trang báo cáo bán hàng: "Từ ngày" phải nhỏ hơn "Đến ngày", và "Đến ngày" không được lớn hơn ngày hiện tại. Khi phạm lỗi, giao diện hiển thị thông báo ngay dưới ô nhập và giữ dữ liệu an toàn.

---

## Files đã tạo / chỉnh sửa

| File                                        | Hành động | Mô tả                                                                         |
| ------------------------------------------- | --------- | ----------------------------------------------------------------------------- |
| `src/pages/SalesTransactions.tsx`           | Cập nhật  | Thêm logic kiểm tra ngày, giới hạn phạm vi lọc và truyền lỗi xuống filter bar |
| `src/components/reports/SalesFilterBar.tsx` | Cập nhật  | Hiển thị lỗi inline và ràng buộc `min`/`max` cho 2 ô ngày                     |

---

## Giải thích kỹ thuật

Kiểm tra được xử lý ở page để dữ liệu lọc luôn nhất quán với UI. Ô "Đến ngày" bị chặn tối đa ở ngày hiện tại, còn ô "Từ ngày" bị giới hạn trước "Đến ngày" để giảm khả năng nhập sai ngay từ đầu.

---

## Cách dùng

Chọn một khoảng ngày hợp lệ trong trang "Báo cáo" của `SalesTransactions`. Nếu chọn sai, hệ thống sẽ báo lỗi ngay dưới ô ngày tương ứng.

---

## Bước tiếp theo (nếu có)

- [ ] Kiểm tra lại trên trình duyệt với vài khoảng ngày hợp lệ / không hợp lệ
