# Thêm tab Dịch vụ trong Inventory

**Ngày:** 2026-06-02  
**Loại:** Feature

---

## Tóm tắt

Đã thêm tab Dịch vụ ngay sau Kho thuốc trong trang Inventory, kèm bảng quản lý dạng CRUD và modal thêm/chỉnh sửa/xóa theo cùng pattern với các tab quản trị hiện có. Dữ liệu dịch vụ được lưu trong collection `services` của Firestore và được bảo vệ bằng rules cho kho tổng.

---

## Files đã tạo / chỉnh sửa

| File                                                         | Hành động | Mô tả                                                                       |
| ------------------------------------------------------------ | --------- | --------------------------------------------------------------------------- |
| `src/types/firestore.ts`                                     | Cập nhật  | Thêm `ServiceDoc` và `ServiceType` cho collection dịch vụ                   |
| `src/services/inventory.ts`                                  | Cập nhật  | Thêm CRUD cho `services`                                                    |
| `src/components/inventory/ServiceTable.tsx`                  | Tạo mới   | Bảng quản lý dịch vụ với search, pagination, modal add/edit, delete confirm |
| `src/pages/Inventory.tsx`                                    | Cập nhật  | Thêm tab Dịch vụ và render `ServiceTable`                                   |
| `firestore.rules`                                            | Cập nhật  | Thêm quyền truy cập cho collection `services`                               |
| `.github/instructions/database.instructions.md`              | Cập nhật  | Ghi nhận schema collection `services`                                       |
| `docs/summaries/2026-06-02_feature-inventory-service-tab.md` | Tạo mới   | Tóm tắt thay đổi và cách dùng                                               |

---

## Giải thích kỹ thuật

Dịch vụ được mô hình hóa như một master data độc lập, tương tự `medicines`, `suppliers`, và `units`, nên dùng collection riêng `services` thay vì nhét chung vào các collection tồn tại. UI được triển khai theo đúng pattern CRUD sẵn có trong dự án để giữ trải nghiệm nhất quán và giảm rủi ro regressions.

---

## Cách dùng

Vào trang Inventory, chọn tab Dịch vụ, rồi dùng nút Thêm dịch vụ mới để tạo dịch vụ như tiêm, khám/tư vấn hoặc loại khác. Sau khi thêm, bảng sẽ tự reload và cho phép chỉnh sửa/xóa từng dòng.

---

## Bước tiếp theo (nếu có)

- [ ] Nếu cần, bổ sung seed data ban đầu cho collection `services`
