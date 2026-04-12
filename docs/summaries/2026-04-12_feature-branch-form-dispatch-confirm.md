# Branch Form Modal + Dispatch Confirm Receipt

**Ngày:** 2026-04-12  
**Loại:** Feature

---

## Tóm tắt

1. Cố định lỗi encoding (`Ä'` → `đ`, `Ä'ưá»ng` → `đường`) trong `DispatchDetailModal.tsx` và thêm props `onConfirmReceived`/`confirmingId` để branch có thể xác nhận nhận hàng từ popup chi tiết.
2. Thêm hàm `adminCreateBranchUser` (dùng secondary Firebase app) và `updateBranchUser` để quản lý tài khoản chi nhánh mà không ảnh hưởng session admin hiện tại.
3. Tạo `BranchFormModal` — modal Add/Edit chi nhánh đầy đủ (tên, mã, địa chỉ, email, mật khẩu, trạng thái).
4. Kết nối nút "Thêm chi nhánh mới" và nút edit trong `BranchTable` vào modal.

---

## Files đã tạo / chỉnh sửa

| File                                                | Hành động | Mô tả                                                                                                                                         |
| --------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/dispatches/DispatchDetailModal.tsx` | Cập nhật  | Fix encoding `Ä'` → `đ`; thêm props `onConfirmReceived`, `confirmingId`; nút "Xác nhận nhập kho" trong footer (ẩn khi `received`/`cancelled`) |
| `src/services/firebase.ts`                          | Cập nhật  | Export `firebaseConfig` để dùng với secondary app                                                                                             |
| `src/services/auth.ts`                              | Cập nhật  | Thêm `adminCreateBranchUser` — tạo tài khoản branch qua secondary Firebase app (không log out admin)                                          |
| `src/services/user.ts`                              | Cập nhật  | Thêm `updateBranchUser` — cập nhật thông tin branch trong Firestore                                                                           |
| `src/components/branches/BranchFormModal.tsx`       | Tạo mới   | Modal Add/Edit chi nhánh với validation, xử lý lỗi Firebase Auth                                                                              |
| `src/components/branches/BranchTable.tsx`           | Cập nhật  | Thêm prop `onRefresh`; nút "Thêm" và "Edit" mở `BranchFormModal`                                                                              |
| `src/pages/Branches.tsx`                            | Cập nhật  | Refactor thành `loadBranches()` hàm, truyền `onRefresh` xuống `BranchTable`                                                                   |

---

## Giải thích kỹ thuật

### Secondary Firebase App pattern

Khi admin tạo tài khoản chi nhánh mới bằng `createUserWithEmailAndPassword`, Firebase Auth mặc định **đăng nhập** vào tài khoản vừa tạo, log out admin. Giải pháp: khởi tạo một instance Firebase thứ hai (`initializeApp(firebaseConfig, "secondary-{timestamp}")`), thực hiện signup trên instance đó, sau đó `signOut` + `deleteApp` để giải phóng resource. Session admin hoàn toàn không bị ảnh hưởng.

### DispatchDetailModal confirm button

Button "Xác nhận nhập kho" chỉ hiện khi:

- Prop `onConfirmReceived` được truyền vào (chỉ branch-side `ImportList` truyền)
- `order.status !== "received"` và `!== "cancelled"`

Điều này giúp `DispatchDetailModal` dùng được ở cả manager view (không có confirm) và branch view (có confirm).

---

## Cách dùng

```tsx
// Branch-side ImportList.tsx (đã tích hợp)
<DispatchDetailModal
  open={!!selectedDispatch}
  onClose={() => setSelectedDispatch(null)}
  order={selectedDispatch}
  onConfirmReceived={handleConfirmReceived}
  confirmingId={confirmingId}
/>

// BranchFormModal — tự động trong BranchTable, không cần dùng trực tiếp
```

---

## Bước tiếp theo (nếu có)

- [ ] Cho phép reset mật khẩu chi nhánh từ trang Branches (cần Firebase Admin SDK hoặc Cloud Function)
- [ ] Thêm stock_movement record khi `confirmDispatchReceived` chạy (audit trail)
