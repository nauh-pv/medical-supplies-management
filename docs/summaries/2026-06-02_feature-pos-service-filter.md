# Bổ sung dịch vụ vào POS

**Ngày:** 2026-06-02  
**Loại:** Feature

---

## Tóm tắt

Đã mở rộng POS để load thêm dịch vụ từ Firestore, thêm filter `Dịch vụ`, và cho phép mục `Tất cả` hiển thị chung cả thuốc lẫn dịch vụ. Dịch vụ được thêm thẳng vào giỏ hàng và đi qua checkout cùng hóa đơn POS, nhưng không chạy logic batch hoặc trừ tồn kho.

---

## Files đã tạo / chỉnh sửa

| File                                               | Hành động | Mô tả                                                            |
| -------------------------------------------------- | --------- | ---------------------------------------------------------------- |
| `src/types/firestore.ts`                           | Cập nhật  | Thêm `itemType` cho `PosTransactionItem`                         |
| `src/services/pos.ts`                              | Cập nhật  | Hỗ trợ tạo hóa đơn có cả medicine item và service item           |
| `src/components/pos/ProductGrid.tsx`               | Cập nhật  | Load thêm `services`, thêm filter Dịch vụ và render service card |
| `src/pages/POS.tsx`                                | Cập nhật  | Thêm cart flow cho dịch vụ                                       |
| `src/components/pos/OrderSummary.tsx`              | Cập nhật  | Hiển thị item dịch vụ đúng cách trong giỏ hàng                   |
| `src/components/reports/SalesTransactionTable.tsx` | Cập nhật  | Ẩn lot khi item không có lô                                      |
| `src/services/dashboard.ts`                        | Cập nhật  | Bỏ qua service item khi thống kê top medicines                   |
| `src/services/settlement.ts`                       | Cập nhật  | Bỏ qua service item khi tính profit                              |
| `.github/instructions/database.instructions.md`    | Cập nhật  | Ghi nhận schema `pos_transactions` mới                           |

---

## Giải thích kỹ thuật

POS hiện dùng chung một cart cho cả thuốc và dịch vụ, nhưng mỗi item mang `itemType` để service layer phân biệt nhánh xử lý. Thuốc vẫn đi qua batch/inventory như cũ, còn dịch vụ chỉ tạo line item doanh thu. Cách này giữ được checkout một bước mà không phá luồng tồn kho hiện tại.

---

## Cách dùng

Mở POS, lọc `Dịch vụ`, chọn dịch vụ cần bán, rồi thanh toán như bình thường. Nếu đang ở `Tất cả`, bạn sẽ thấy cả thuốc và dịch vụ trong cùng lưới sản phẩm.

---

## Bước tiếp theo (nếu có)

- [ ] Nếu cần, mình có thể thêm icon/nhãn riêng cho item dịch vụ trong màn chi tiết hóa đơn.
