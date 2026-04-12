# Gộp bảng Branches + Users thành một

**Ngày:** 2026-04-12  
**Loại:** Feature

---

## Tóm tắt

Gộp collection `branches` và `users` trong Firestore thành một — mỗi user account chính là một chi nhánh. Trang Branches đọc từ `users` (filter `role === "branch"`), form đăng ký thu thập thêm thông tin chi nhánh, và tất cả các component liên quan đã được cập nhật để dùng `UserDoc` thay vì `BranchDoc`.

---

## Files đã tạo / chỉnh sửa

| File                                               | Hành động | Mô tả                                                                                                                                  |
| -------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/firestore.ts`                           | Cập nhật  | Thêm `branchCode`, `branchAddress`, `status` vào `UserDoc`                                                                             |
| `src/services/auth.ts`                             | Cập nhật  | `signUp` nhận thêm `branchName`, `branchCode`, `branchAddress`; lưu vào `users` collection                                             |
| `src/services/inventory.ts`                        | Cập nhật  | `getBranches` query từ `users` where `role == "branch"` thay vì `branches` collection                                                  |
| `src/pages/Register.tsx`                           | Cập nhật  | Thêm form fields Tên chi nhánh / Mã chi nhánh / Địa chỉ (hiện khi chọn vai trò "Nhân viên chi nhánh")                                  |
| `src/pages/Branches.tsx`                           | Cập nhật  | Dùng `UserDoc[]` thay vì `BranchDoc[]`                                                                                                 |
| `src/components/branches/BranchStatCards.tsx`      | Cập nhật  | Dùng `UserDoc[]`; fix encoding corruption                                                                                              |
| `src/components/branches/BranchTable.tsx`          | Cập nhật  | Dùng `UserDoc[]`; cột "Người quản lý" → "Tài khoản" hiển thị `displayName` + `email`; dùng `branchName`, `branchCode`, `branchAddress` |
| `src/components/dispatches/CreateDispatchForm.tsx` | Cập nhật  | Dùng `UserDoc[]`; `b.id` → `b.uid`, `b.name` → `b.branchName ?? b.displayName`                                                         |

---

## Giải thích kỹ thuật

- **Merged schema:** `UserDoc` giờ chứa cả thông tin người dùng (`email`, `displayName`, `phone`, `role`) lẫn thông tin chi nhánh (`branchName`, `branchCode`, `branchAddress`, `status`). Các trường chi nhánh = `null` với `warehouse_manager`.
- **branchId:** Khi `role === "branch"`, `branchId` được set = `uid` của chính user đó (self-reference) — các điểm dùng `branchId` trong POS và dispatch vẫn hoạt động đúng.
- **getBranches:** Dùng Firestore `where("role", "==", "branch")` để filter users, sort theo `branchName ?? displayName`.
- **Collection `branches`:** Không còn được dùng ở frontend nữa; data cũ trong Firestore không bị xóa nhưng không được đọc.

---

## Cách dùng

**Đăng ký tài khoản chi nhánh:**

```
1. Chọn vai trò "Nhân viên chi nhánh"
2. Nhập thêm: Tên chi nhánh, Mã chi nhánh (optional), Địa chỉ chi nhánh (optional)
3. Submit → lưu vào users collection với đầy đủ thông tin
```

**Trang Chi nhánh:**
Dữ liệu được load từ `users where role == "branch"`. Bảng hiển thị:

- Tên chi nhánh (branchName) + Mã (branchCode)
- Địa chỉ (branchAddress)
- Tài khoản: displayName + email
- Số điện thoại, Trạng thái, Hành động

---

## Bước tiếp theo (nếu có)

- [ ] Nút "Thêm chi nhánh mới" trên trang Branches → mở form tạo tài khoản chi nhánh cho admin
- [ ] Admin có thể edit/deactivate tài khoản chi nhánh trực tiếp từ bảng
