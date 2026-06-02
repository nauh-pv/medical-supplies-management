---
applyTo: "src/**/*.{tsx,ts}"
---

# Firebase Firestore Database Schema — Medical Supplies Management

> **RULES (enforce every time):**
>
> 1. **Always read this file before writing any Firebase query, service function, or data type.**
> 2. Use the exact field names defined here — never rename fields inline.
> 3. Always denormalize fields marked with `← denormalized` to avoid extra reads.
> 4. Never embed large arrays in a document if they can grow unboundedly — use subcollections or separate top-level collections.
> 5. All timestamps use Firestore `Timestamp` (never `string` or `Date`).
> 6. All monetary values are stored as `number` in **VNĐ** (no formatting, no string).
> 7. `id` field always mirrors the Firestore document ID.
> 8. For security rules: always filter by `locationId == branchId` for branch-scoped collections.

---

## Roles

| Role        | Value               | Description                                  |
| ----------- | ------------------- | -------------------------------------------- |
| Quản lý kho | `warehouse_manager` | Toàn quyền quản lý hệ thống                  |
| Chi nhánh   | `branch`            | Chỉ thao tác trên dữ liệu của chi nhánh mình |

---

## Nghiệp vụ tổng quan

```
NCC giao hàng → Kho Tổng nhận, nhân viên nhập liệu thủ công → [import_orders] (phiếu nhập kho)
Kho Tổng      → [dispatch_orders] → Chi nhánh
Chi nhánh     → [import_requests] → Kho Tổng  (yêu cầu hàng)
Chi nhánh     → [pos_transactions]→ Khách hàng
```

> ⚠️ **Lưu ý luồng nhập kho:** Kho tổng **không** tạo đơn đặt hàng trước. Khi hàng từ NCC về, nhân viên kho mở web và nhập phiếu nhập kho ngay lúc đó. Document `import_orders` chỉ được tạo **một lần duy nhất** khi hàng đã có mặt tại kho.

---

## Collections

### 1. `users`

**Path:** `/users/{uid}`  
**Mục đích:** Lưu thông tin tài khoản người dùng. Mỗi document tương ứng 1 tài khoản Firebase Auth.

| Field         | Kiểu           | Giải thích                                                                     |
| ------------- | -------------- | ------------------------------------------------------------------------------ |
| `uid`         | string         | ID tài khoản Firebase Auth, trùng với document ID                              |
| `email`       | string         | Email đăng nhập                                                                |
| `displayName` | string         | Tên hiển thị đầy đủ                                                            |
| `phone`       | string         | Số điện thoại liên hệ                                                          |
| `role`        | string         | Vai trò: `warehouse_manager` (quản lý kho) hoặc `branch` (nhân viên chi nhánh) |
| `branchId`    | string \| null | ID của chi nhánh mà user này thuộc về. `null` nếu là quản lý kho               |
| `branchName`  | string \| null | Tên chi nhánh (tự động copy từ `branches` để tránh join thêm)                  |
| `isActive`    | boolean        | Tài khoản có đang hoạt động không (dùng để vô hiệu hoá mà không xoá)           |
| `createdAt`   | Timestamp      | Thời điểm tạo tài khoản                                                        |
| `updatedAt`   | Timestamp      | Thời điểm cập nhật lần cuối                                                    |

```ts
interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: "warehouse_manager" | "branch";
  branchId: string | null; // null nếu là warehouse_manager
  branchName: string | null; // denormalized từ branches
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 2. `medicines`

**Path:** `/medicines/{medicineId}`  
**Quản lý bởi:** `warehouse_manager` only  
**Mục đích:** Catalogue tất cả dược phẩm/vật tư y tế trong hệ thống. Đây là bảng master — không lưu tồn kho ở đây, tồn kho lưu ở `inventory`.

| Field           | Kiểu           | Giải thích                                                                                                                                              |
| --------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | string         | Document ID                                                                                                                                             |
| `sku`           | string         | Mã định danh duy nhất của sản phẩm, ví dụ `MED-00123`                                                                                                   |
| `name`          | string         | Tên thuốc/vật tư                                                                                                                                        |
| `description`   | string         | Mô tả chi tiết, công dụng                                                                                                                               |
| `category`      | string         | Phân loại: `prescribed` (thuốc kê đơn) hoặc `otc` (thuốc không kê đơn)                                                                                  |
| `unitId`        | string         | ID đơn vị tính (ref → `units`)                                                                                                                          |
| `unitName`      | string         | Tên đơn vị tính (copy sẵn để tránh join)                                                                                                                |
| `importPrice`   | number         | Giá nhập (VNĐ)                                                                                                                                          |
| `sellPrice`     | number         | Giá bán lẻ (VNĐ)                                                                                                                                        |
| `minStockLevel` | number         | Ngưỡng tồn kho tối thiểu — khi xuống dưới mức này sẽ cảnh báo low-stock                                                                                 |
| `imageUrl`      | string \| null | URL ảnh sản phẩm trên **Firebase Storage** — `null` nếu chưa upload. **Không dùng base64** (quá nặng, vượt giới hạn 1MB/document, không cache được CDN) |
| `icon`          | string         | Tên icon Material Symbol dùng làm placeholder khi `imageUrl` là `null`                                                                                  |
| `iconBg`        | string         | Màu nền icon (Tailwind class), ví dụ `bg-primary-fixed`                                                                                                 |
| `iconColor`     | string         | Màu icon (Tailwind class), ví dụ `text-primary`                                                                                                         |
| `isActive`      | boolean        | Sản phẩm có đang được bán/kinh doanh không                                                                                                              |
| `createdAt`     | Timestamp      | Ngày thêm vào hệ thống                                                                                                                                  |
| `updatedAt`     | Timestamp      | Lần cập nhật cuối                                                                                                                                       |

```ts
interface MedicineDoc {
  id: string;
  sku: string; // "MED-00123"
  name: string;
  description: string;
  category: "prescribed" | "otc";
  unitId: string; // ref → units
  unitName: string; // denormalized
  importPrice: number; // VNĐ
  sellPrice: number; // VNĐ
  minStockLevel: number; // ngưỡng cảnh báo low-stock
  imageUrl: string | null; // Firebase Storage URL — null nếu chưa có ảnh
  icon: string; // Material Symbol name — dùng khi imageUrl là null
  iconBg: string; // Tailwind class màu nền icon
  iconColor: string; // Tailwind class màu icon
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 4. `inventory`

**Path:** `/inventory/{inventoryId}`  
**Mục đích:** Lưu số lượng tồn kho của từng sản phẩm tại từng địa điểm (kho tổng hoặc chi nhánh). Mỗi cặp `(medicineId, locationId)` là 1 document duy nhất.

| Field           | Kiểu      | Giải thích                                                                                      |
| --------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `id`            | string    | Document ID                                                                                     |
| `medicineId`    | string    | ID sản phẩm (ref → `medicines`)                                                                 |
| `medicineName`  | string    | Tên sản phẩm (copy sẵn để tránh join)                                                           |
| `medicineSku`   | string    | Mã SKU sản phẩm (copy sẵn)                                                                      |
| `locationId`    | string    | Nơi lưu kho: `"WAREHOUSE"` cho kho tổng, hoặc `branchId` cho chi nhánh                          |
| `locationType`  | string    | Loại địa điểm: `warehouse` hoặc `branch`                                                        |
| `quantity`      | number    | Số lượng tồn kho hiện tại tại địa điểm này                                                      |
| `minStockLevel` | number    | Ngưỡng cảnh báo riêng cho địa điểm này. Nếu = `0` thì dùng giá trị từ `medicines.minStockLevel` |
| `updatedAt`     | Timestamp | Thời điểm cập nhật tồn kho lần cuối                                                             |

//thiếu lưu số lô nhập về, lưu ngày sản xuất, hạn sử dụng

```ts
interface InventoryDoc {
  id: string;
  medicineId: string; // ref → medicines
  medicineName: string; // denormalized
  medicineSku: string; // denormalized
  locationId: string; // branchId hoặc "WAREHOUSE"
  locationType: "warehouse" | "branch";
  quantity: number;
  minStockLevel: number; // override per-location; nếu 0 → dùng medicines.minStockLevel
  updatedAt: Timestamp;
}
```

> **Query branch stock:** `where("locationId", "==", branchId)`  
> **Query low stock:** `where("locationId", "==", x).where("quantity", "<=", "minStockLevel")` — thực hiện client-side filter

---

### 5. `batches`

**Path:** `/batches/{batchId}`  
**Mục đích:** Theo dõi từng lô hàng (lot) cụ thể — biết hàng nhập từ NCC nào, ngày nào, hạn dùng đến khi nào, còn bao nhiêu. Phục vụ cảnh báo hết hạn và truy xuất nguồn gốc.

| Field             | Kiểu           | Giải thích                                                                                                                             |
| ----------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | string         | Document ID                                                                                                                            |
| `medicineId`      | string         | ID sản phẩm thuộc lô này (ref → `medicines`)                                                                                           |
| `medicineName`    | string         | Tên sản phẩm (copy sẵn)                                                                                                                |
| `medicineSku`     | string         | Mã SKU (copy sẵn)                                                                                                                      |
| `lot`             | string         | Số lô do nhà sản xuất đặt, ví dụ `LOT20231201X`                                                                                        |
| `supplierId`      | string         | NCC cung cấp lô này (ref → `suppliers`)                                                                                                |
| `supplierName`    | string         | Tên NCC (copy sẵn)                                                                                                                     |
| `locationId`      | string         | Lô này đang ở kho nào / chi nhánh nào                                                                                                  |
| `locationType`    | string         | `warehouse` hoặc `branch`                                                                                                              |
| `quantity`        | number         | Số lượng **còn lại** trong lô (giảm dần khi xuất/bán)                                                                                  |
| `initialQuantity` | number         | Số lượng ban đầu khi nhập lô — dùng để tính tỷ lệ đã dùng                                                                              |
| `importPrice`     | number         | Giá nhập của lô này (VNĐ/đơn vị) — dùng để tính `totalCost` khi bán POS                                                                |
| `importDate`      | Timestamp      | Ngày nhập lô hàng                                                                                                                      |
| `expiryDate`      | Timestamp      | Ngày hết hạn sử dụng — dùng để cảnh báo trên trang Alerts                                                                              |
| `status`          | string         | `active` (đang dùng), `expired` (đã hết hạn), `recalled` (bị thu hồi)                                                                  |
| `importOrderId`   | string         | ID đơn nhập hàng tạo ra lô này (ref → `import_orders`)                                                                                 |
| `parentBatchId`   | string \| null | `null` nếu lô gốc từ nhập kho. Có giá trị nếu lô này được **tách ra** từ lô gốc khi dispatch một phần sang chi nhánh (ref → `batches`) |
| `createdAt`       | Timestamp      | Ngày tạo document lô                                                                                                                   |

```ts
interface BatchDoc {
  id: string;
  medicineId: string; // ref → medicines
  medicineName: string; // denormalized
  medicineSku: string; // denormalized
  lot: string; // "LOT20231201X"
  supplierId: string; // ref → suppliers
  supplierName: string; // denormalized
  locationId: string; // branchId hoặc "WAREHOUSE"
  locationType: "warehouse" | "branch";
  quantity: number; // số lượng còn lại trong lô này
  initialQuantity: number; // số lượng ban đầu nhập về
  importPrice: number; // VNĐ
  importDate: Timestamp;
  expiryDate: Timestamp; // dùng cho cảnh báo hết hạn
  status: "active" | "expired" | "recalled";
  importOrderId: string; // ref → import_orders
  parentBatchId: string | null; // null nếu lô gốc; có giá trị nếu lô được tách ra khi dispatch một phần
  createdAt: Timestamp;
}
```

> **Query expiring soon:** `where("expiryDate", "<=", dateIn30Days).where("status", "==", "active")`

---

### 6. `suppliers`

**Path:** `/suppliers/{supplierId}`  
**Mục đích:** Danh sách nhà cung cấp (NCC). Chỉ quản lý kho truy cập, dùng khi tạo đơn nhập hàng.

| Field       | Kiểu      | Giải thích                      |
| ----------- | --------- | ------------------------------- |
| `id`        | string    | Document ID                     |
| `code`      | string    | Mã NCC ngắn gọn, ví dụ `NCC001` |
| `name`      | string    | Tên công ty / nhà cung cấp      |
| `phone`     | string    | Số điện thoại liên hệ           |
| `email`     | string    | Email liên hệ                   |
| `address`   | string    | Địa chỉ NCC                     |
| `isActive`  | boolean   | NCC có đang hợp tác không       |
| `createdAt` | Timestamp | Ngày thêm NCC vào hệ thống      |

```ts
interface SupplierDoc {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdAt: Timestamp;
}
```

---

### 7. `units`

**Path:** `/units/{unitId}`  
**Mục đích:** Danh mục đơn vị tính dùng chung cho toàn hệ thống. Quản lý tại trang Units.

| Field         | Kiểu      | Giải thích                                              |
| ------------- | --------- | ------------------------------------------------------- |
| `id`          | string    | Document ID                                             |
| `name`        | string    | Tên đơn vị, ví dụ: `Viên`, `Hộp`, `Chai`, `Tuýp`, `Gói` |
| `description` | string    | Mô tả thêm nếu cần, ví dụ "Hộp 30 viên"                 |
| `createdAt`   | Timestamp | Ngày tạo                                                |

```ts
interface UnitDoc {
  id: string;
  name: string; // "Viên", "Hộp", "Chai", "Tuýp"
  description: string;
  createdAt: Timestamp;
}
```

---

### 8. `services`

**Path:** `/services/{serviceId}`  
**Mục đích:** Danh mục dịch vụ y tế dùng cho quản lý kho tổng, ví dụ tiêm, khám, tư vấn. Chỉ quản lý kho truy cập.

| Field         | Kiểu      | Giải thích                                         |
| ------------- | --------- | -------------------------------------------------- |
| `id`          | string    | Document ID                                        |
| `code`        | string    | Mã dịch vụ ngắn gọn, ví dụ `DVC-AB12`              |
| `name`        | string    | Tên dịch vụ                                        |
| `type`        | string    | Loại dịch vụ: `injection`, `consultation`, `other` |
| `price`       | number    | Giá dịch vụ (VNĐ)                                  |
| `description` | string    | Mô tả ngắn                                         |
| `isActive`    | boolean   | Dịch vụ có đang được sử dụng không                 |
| `createdAt`   | Timestamp | Ngày tạo                                           |
| `updatedAt`   | Timestamp | Ngày cập nhật cuối                                 |

```ts
interface ServiceDoc {
  id: string;
  code: string;
  name: string;
  type: "injection" | "consultation" | "other";
  price: number;
  description: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 8. `import_orders`

**Path:** `/import_orders/{orderId}`  
**Mục đích:** Phiếu nhập kho — ghi nhận lô hàng từ NCC vừa về đến kho tổng. Tạo bởi `warehouse_manager`.  
**Luồng:** NCC giao hàng đến kho → Nhân viên kho kiểm đếm xong → Mở web, nhập phiếu nhập kho → Document được tạo → Tồn kho tăng ngay, lô mới được tạo trong `batches`.

> ⚠️ Document này **chỉ tạo một lần** khi hàng đã có tại kho. Không có bước tạo yêu cầu hay đặt hàng trước.

#### Trường của `ImportOrderItem` (mỗi dòng sản phẩm trong phiếu):

| Field          | Kiểu      | Giải thích                          |
| -------------- | --------- | ----------------------------------- |
| `medicineId`   | string    | ID sản phẩm (ref → `medicines`)     |
| `medicineName` | string    | Tên sản phẩm (copy sẵn)             |
| `medicineSku`  | string    | Mã SKU (copy sẵn)                   |
| `lot`          | string    | Số lô ghi trên bao bì từ NCC        |
| `quantity`     | number    | Số lượng thực nhận                  |
| `unitId`       | string    | Đơn vị tính (ref → `units`)         |
| `unitName`     | string    | Tên đơn vị (copy sẵn)               |
| `unitPrice`    | number    | Đơn giá nhập (VNĐ)                  |
| `total`        | number    | Thành tiền = `quantity × unitPrice` |
| `expiryDate`   | Timestamp | Ngày hết hạn ghi trên lô hàng       |

#### Trường của `ImportOrderDoc`:

| Field           | Kiểu      | Giải thích                                        |
| --------------- | --------- | ------------------------------------------------- |
| `id`            | string    | Document ID                                       |
| `code`          | string    | Mã phiếu nhập, ví dụ `IMP-20231201-001`           |
| `supplierId`    | string    | NCC giao hàng lần này (ref → `suppliers`)         |
| `supplierName`  | string    | Tên NCC (copy sẵn)                                |
| `createdBy`     | string    | `uid` nhân viên kho nhập liệu                     |
| `createdByName` | string    | Tên người nhập liệu (copy sẵn)                    |
| `items`         | array     | Danh sách sản phẩm đã nhận trong lần này          |
| `subtotal`      | number    | Tổng tiền hàng trước VAT (VNĐ)                    |
| `vat`           | number    | Tiền VAT (VNĐ)                                    |
| `total`         | number    | Tổng cộng giá trị lô hàng (VNĐ)                   |
| `notes`         | string    | Ghi chú (số hoá đơn NCC, tên tài xế giao hàng...) |
| `createdAt`     | Timestamp | Thời điểm nhập phiếu = thời điểm hàng về kho      |

```ts
interface ImportOrderItem {
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  lot: string;
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number; // VNĐ
  total: number; // VNĐ
  expiryDate: Timestamp;
}

interface ImportOrderDoc {
  id: string;
  code: string; // "IMP-20231201-001"
  supplierId: string;
  supplierName: string; // denormalized
  createdBy: string; // uid
  createdByName: string; // denormalized
  items: ImportOrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  notes: string;
  createdAt: Timestamp;
}
```

---

### 9. `dispatch_orders`

**Path:** `/dispatch_orders/{orderId}`  
**Mục đích:** Phiếu điều phối hàng từ kho tổng xuống chi nhánh (hoặc giữa chi nhánh với nhau).  
**Luồng:** Quản lý kho tạo phiếu → hàng được vận chuyển → chi nhánh xác nhận nhận hàng → tồn kho kho tổng giảm, tồn kho chi nhánh tăng.

#### Trường của `DispatchOrderItem`:

| Field          | Kiểu   | Giải thích                             |
| -------------- | ------ | -------------------------------------- |
| `medicineId`   | string | ID sản phẩm                            |
| `medicineName` | string | Tên sản phẩm (copy sẵn)                |
| `medicineSku`  | string | Mã SKU (copy sẵn)                      |
| `lot`          | string | Số lô đang xuất                        |
| `batchId`      | string | ID lô hàng đang xuất (ref → `batches`) |
| `quantity`     | number | Số lượng xuất                          |
| `unitId`       | string | Đơn vị tính                            |
| `unitName`     | string | Tên đơn vị (copy sẵn)                  |
| `unitPrice`    | number | Giá trị tham chiếu (VNĐ)               |
| `total`        | number | Thành tiền (VNĐ)                       |

#### Trường của `DispatchOrderDoc`:

| Field              | Kiểu              | Giải thích                                         |
| ------------------ | ----------------- | -------------------------------------------------- |
| `id`               | string            | Document ID                                        |
| `code`             | string            | Mã phiếu, ví dụ `DIS-20231201-001`                 |
| `fromLocationId`   | string            | Nguồn xuất hàng: `"WAREHOUSE"` hoặc `branchId`     |
| `fromLocationType` | string            | `warehouse` hoặc `branch`                          |
| `toLocationId`     | string            | Chi nhánh nhận hàng (`branchId`)                   |
| `toLocationType`   | string            | Luôn là `"branch"`                                 |
| `toLocationName`   | string            | Tên chi nhánh nhận (copy sẵn để hiển thị)          |
| `createdBy`        | string            | `uid` người tạo phiếu                              |
| `createdByName`    | string            | Tên người tạo (copy sẵn)                           |
| `status`           | string            | `pending` → `shipping` → `received` \| `cancelled` |
| `items`            | array             | Danh sách sản phẩm trong phiếu                     |
| `totalQty`         | number            | Tổng số lượng tất cả sản phẩm                      |
| `subtotal`         | number            | Tổng giá trị hàng (VNĐ)                            |
| `total`            | number            | Tổng cộng (VNĐ)                                    |
| `notes`            | string            | Ghi chú                                            |
| `createdAt`        | Timestamp         | Ngày tạo phiếu                                     |
| `updatedAt`        | Timestamp         | Lần cập nhật cuối                                  |
| `shippedAt`        | Timestamp \| null | Thời điểm bắt đầu vận chuyển                       |
| `receivedAt`       | Timestamp \| null | Thời điểm chi nhánh xác nhận nhận hàng             |

```ts
interface DispatchOrderItem {
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  lot: string;
  batchId: string; // ref → batches
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number; // VNĐ
  total: number; // VNĐ
}

interface DispatchOrderDoc {
  id: string;
  code: string; // "DIS-20231201-001"
  fromLocationId: string; // "WAREHOUSE" hoặc branchId
  fromLocationType: "warehouse" | "branch";
  toLocationId: string; // branchId nhận
  toLocationType: "branch";
  toLocationName: string; // denormalized tên chi nhánh
  createdBy: string; // uid
  createdByName: string; // denormalized
  status: "pending" | "shipping" | "received" | "cancelled";
  items: DispatchOrderItem[];
  totalQty: number;
  subtotal: number;
  total: number;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  shippedAt: Timestamp | null;
  receivedAt: Timestamp | null;
}
```

> **Branch query:** `where("toLocationId", "==", branchId)`

---

### 10. `import_requests`

**Path:** `/import_requests/{requestId}`  
**Mục đích:** Chi nhánh gửi yêu cầu lên kho tổng để xin thêm hàng. Quản lý kho duyệt rồi tạo `dispatch_order` để fulfil.  
**Luồng:** Chi nhánh tạo yêu cầu → Quản lý kho duyệt/từ chối → Nếu duyệt, tạo `dispatch_order` và gán `fulfilledOrderId`.

#### Trường của `ImportRequestItem`:

| Field            | Kiểu   | Giải thích                                      |
| ---------------- | ------ | ----------------------------------------------- |
| `medicineId`     | string | ID sản phẩm yêu cầu                             |
| `medicineName`   | string | Tên sản phẩm (copy sẵn)                         |
| `medicineSku`    | string | Mã SKU (copy sẵn)                               |
| `quantity`       | number | Số lượng yêu cầu                                |
| `unitId`         | string | Đơn vị tính                                     |
| `unitName`       | string | Tên đơn vị (copy sẵn)                           |
| `estimatedPrice` | number | Giá ước tính để tính tổng giá trị yêu cầu (VNĐ) |
| `notes`          | string | Ghi chú riêng cho từng sản phẩm                 |

#### Trường của `ImportRequestDoc`:

| Field              | Kiểu              | Giải thích                                                                                         |
| ------------------ | ----------------- | -------------------------------------------------------------------------------------------------- |
| `id`               | string            | Document ID                                                                                        |
| `code`             | string            | Mã yêu cầu, ví dụ `REQ-20231201-001`                                                               |
| `branchId`         | string            | Chi nhánh gửi yêu cầu                                                                              |
| `branchName`       | string            | Tên chi nhánh (copy sẵn)                                                                           |
| `createdBy`        | string            | `uid` nhân viên chi nhánh tạo yêu cầu                                                              |
| `createdByName`    | string            | Tên người tạo (copy sẵn)                                                                           |
| `priority`         | string            | Mức độ ưu tiên: `urgent` (khẩn), `normal` (bình thường), `low` (thấp)                              |
| `status`           | string            | `pending` (chờ duyệt) → `approved` (đã duyệt) \| `rejected` (từ chối) → `fulfilled` (đã giao hàng) |
| `items`            | array             | Danh sách sản phẩm yêu cầu                                                                         |
| `total`            | number            | Tổng giá trị ước tính (VNĐ)                                                                        |
| `notes`            | string            | Ghi chú chung cho cả yêu cầu                                                                       |
| `createdAt`        | Timestamp         | Ngày tạo yêu cầu                                                                                   |
| `updatedAt`        | Timestamp         | Lần cập nhật cuối                                                                                  |
| `approvedBy`       | string \| null    | `uid` quản lý kho đã duyệt/từ chối                                                                 |
| `approvedByName`   | string \| null    | Tên người duyệt (copy sẵn)                                                                         |
| `approvedAt`       | Timestamp \| null | Thời điểm duyệt/từ chối                                                                            |
| `fulfilledOrderId` | string \| null    | ID phiếu điều phối được tạo để fulfil yêu cầu này (ref → `dispatch_orders`)                        |

```ts
interface ImportRequestItem {
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  quantity: number;
  unitId: string;
  unitName: string;
  estimatedPrice: number; // VNĐ ước tính
  notes: string;
}

interface ImportRequestDoc {
  id: string;
  code: string; // "REQ-20231201-001"
  branchId: string;
  branchName: string; // denormalized
  createdBy: string; // uid (branch user)
  createdByName: string; // denormalized
  priority: "urgent" | "normal" | "low";
  status: "pending" | "approved" | "rejected" | "fulfilled";
  items: ImportRequestItem[];
  total: number; // VNĐ tổng ước tính
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy: string | null; // uid của warehouse_manager
  approvedByName: string | null; // denormalized
  approvedAt: Timestamp | null;
  fulfilledOrderId: string | null; // ref → dispatch_orders khi đã fulfill
}
```

> **Branch query:** `where("branchId", "==", branchId)`  
> **Warehouse query:** `where("status", "==", "pending")` để lấy các yêu cầu còn chờ duyệt

---

### 11. `pos_transactions`

**Mục đích:** Ghi lại mỗi giao dịch bán lẻ tại quầy của chi nhánh. Mỗi lần nhân viên bấm "Thanh toán" trên POS là tạo 1 document.

---

#### 💡 Phân tích kiến trúc — 3 phương án lưu trữ

##### Phương án A — Flat collection (hiện tại)

```
/pos_transactions/{txId}   ← tất cả chi nhánh chung 1 collection
```

|     |                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------- |
| ✅  | Quản lý kho query toàn bộ transaction mọi chi nhánh dễ dàng                                          |
| ✅  | Dashboard tổng hợp doanh thu đơn giản                                                                |
| ✅  | Với **composite index `(branchId, createdAt DESC)`**, tốc độ query branch không kém gì subcollection |
| ❌  | Branch user luôn phải `.where("branchId", "==", x)` — nhưng index đã xử lý điều này                  |

##### Phương án B — Subcollection per branch (ý tưởng bạn đề xuất)

```
/branches/{branchId}/pos_transactions/{txId}
```

|     |                                                                                             |
| --- | ------------------------------------------------------------------------------------------- |
| ✅  | Không cần filter khi đọc từ branch — path đã tự scope                                       |
| ✅  | Security rules đơn giản hơn (chỉ cần check path)                                            |
| ❌  | **Quản lý kho KHÔNG thể query cross-branch bằng query thông thường**                        |
| ❌  | Phải dùng `collectionGroup("pos_transactions")` để tổng hợp → cần index riêng, phức tạp hơn |
| ❌  | Pagination, sorting cross-branch rất khó                                                    |

##### Phương án C — Flat collection + pre-aggregated stats ⭐ **SENIOR RECOMMENDATION**

```
/pos_transactions/{txId}                        ← raw transactions (flat, có index)
/branches/{branchId}/daily_stats/{YYYY-MM-DD}   ← doanh thu tổng hợp theo ngày
```

|     |                                                                                             |
| --- | ------------------------------------------------------------------------------------------- |
| ✅  | Query branch nhanh qua index                                                                |
| ✅  | Dashboard/Reports đọc `daily_stats` thay vì scan toàn bộ transactions → **cực nhanh**       |
| ✅  | Cross-branch aggregation chỉ cần đọc N document `daily_stats` thay vì N×1000 transactions   |
| ✅  | Scale tốt khi dữ liệu lớn                                                                   |
| ⚙️  | Mỗi khi tạo transaction → cũng update `daily_stats` document của ngày đó (dùng `increment`) |

---

#### ✅ Quyết định: **Phương án C** — Flat `pos_transactions` + `daily_stats` subcollection

**Path chính:** `/pos_transactions/{txId}`  
**Path stats:** `/branches/{branchId}/daily_stats/{YYYY-MM-DD}`

---

#### Schema `pos_transactions`

##### Trường của `PosTransactionItem`:

| Field          | Kiểu   | Giải thích                                         |
| -------------- | ------ | -------------------------------------------------- |
| `itemType`     | string | `medicine` hoặc `service`                          |
| `medicineId`   | string | ID sản phẩm bán                                    |
| `medicineName` | string | Tên sản phẩm (copy sẵn)                            |
| `medicineSku`  | string | Mã SKU (copy sẵn)                                  |
| `lot`          | string | Số lô xuất bán; để trống với dịch vụ               |
| `batchId`      | string | ID lô xuất (ref → `batches`); để trống với dịch vụ |
| `quantity`     | number | Số lượng bán                                       |
| `unitId`       | string | Đơn vị tính                                        |
| `unitName`     | string | Tên đơn vị (copy sẵn)                              |
| `unitPrice`    | number | Đơn giá bán tại thời điểm giao dịch (VNĐ)          |
| `total`        | number | Thành tiền (VNĐ)                                   |

##### Trường của `PosTransactionDoc`:

| Field           | Kiểu      | Giải thích                                                                         |
| --------------- | --------- | ---------------------------------------------------------------------------------- |
| `id`            | string    | Document ID                                                                        |
| `code`          | string    | Mã hoá đơn, ví dụ `POS-20231201-001`                                               |
| `branchId`      | string    | Chi nhánh thực hiện giao dịch                                                      |
| `branchName`    | string    | Tên chi nhánh (copy sẵn)                                                           |
| `createdBy`     | string    | `uid` nhân viên bán hàng                                                           |
| `createdByName` | string    | Tên nhân viên (copy sẵn)                                                           |
| `items`         | array     | Danh sách sản phẩm được bán                                                        |
| `subtotal`      | number    | Tổng tiền hàng trước chiết khấu/VAT (VNĐ)                                          |
| `vat`           | number    | Tiền VAT (VNĐ)                                                                     |
| `discount`      | number    | Tiền giảm giá (VNĐ)                                                                |
| `total`         | number    | Tổng cộng khách phải trả (VNĐ)                                                     |
| `paymentMethod` | string    | Phương thức thanh toán: `cash` (tiền mặt), `card` (thẻ), `transfer` (chuyển khoản) |
| `notes`         | string    | Ghi chú (tên bệnh nhân, số đơn thuốc...)                                           |
| `createdAt`     | Timestamp | Thời điểm giao dịch                                                                |

```ts
interface PosTransactionItem {
  itemType: "medicine" | "service";
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  lot: string;
  batchId: string; // ref → batches
  quantity: number;
  unitId: string;
  unitName: string;
  unitPrice: number; // VNĐ
  total: number; // VNĐ
}

interface PosTransactionDoc {
  id: string;
  code: string; // "POS-20231201-001"
  branchId: string;
  branchName: string; // denormalized
  createdBy: string; // uid
  createdByName: string; // denormalized
  items: PosTransactionItem[];
  subtotal: number;
  vat: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer";
  notes: string;
  createdAt: Timestamp;
}
```

> **Branch query:** `where("branchId", "==", branchId).orderBy("createdAt", "desc")` — dùng composite index

---

#### Schema `daily_stats` (subcollection của branches)

**Path:** `/branches/{branchId}/daily_stats/{YYYY-MM-DD}`  
**Dùng cho:** Biểu đồ **theo tuần** (đọc 7 docs), biểu đồ **theo tháng** (đọc ≤31 docs).

| Field             | Kiểu      | Giải thích                                                             |
| ----------------- | --------- | ---------------------------------------------------------------------- |
| `date`            | string    | Ngày theo format `YYYY-MM-DD` — trùng với document ID                  |
| `year`            | number    | Năm dạng integer, ví dụ `2024` — để query range `where("year","==",x)` |
| `month`           | number    | Tháng 1–12 — để filter theo tháng                                      |
| `week`            | number    | Tuần ISO trong năm (1–53) — để filter theo tuần                        |
| `branchId`        | string    | ID chi nhánh                                                           |
| `totalRevenue`    | number    | Tổng doanh thu trong ngày (VNĐ)                                        |
| `totalCost`       | number    | Tổng giá vốn hàng bán trong ngày (VNĐ) — lấy từ `batch.importPrice`    |
| `totalProfit`     | number    | Lợi nhuận gộp = `totalRevenue - totalCost` (VNĐ)                       |
| `totalOrders`     | number    | Tổng số đơn trong ngày                                                 |
| `totalItems`      | number    | Tổng số lượng sản phẩm bán ra                                          |
| `cashRevenue`     | number    | Doanh thu tiền mặt (VNĐ)                                               |
| `cardRevenue`     | number    | Doanh thu thẻ (VNĐ)                                                    |
| `transferRevenue` | number    | Doanh thu chuyển khoản (VNĐ)                                           |
| `updatedAt`       | Timestamp | Lần cập nhật cuối                                                      |

```ts
interface DailyStatsDoc {
  date: string; // "2024-01-15" — document ID
  year: number; // 2024
  month: number; // 1–12
  week: number; // 1–53 (ISO week)
  branchId: string;
  totalRevenue: number;
  totalCost: number; // FieldValue.increment(sum of batch.importPrice * qty)
  totalProfit: number; // FieldValue.increment(revenue - cost)
  totalOrders: number;
  totalItems: number;
  cashRevenue: number;
  cardRevenue: number;
  transferRevenue: number;
  updatedAt: Timestamp;
}
```

---

#### Schema `monthly_stats` (subcollection của branches)

**Path:** `/branches/{branchId}/monthly_stats/{YYYY-MM}`  
**Dùng cho:** Biểu đồ **theo quý** (đọc 3 docs), biểu đồ **theo năm** (đọc 12 docs), so sánh **nhiều năm** (đọc N×12 docs).

> ⚠️ Không cần tạo `yearly_stats` vì 12 monthly docs là đủ nhẹ để aggregate client-side cho biểu đồ năm.

| Field             | Kiểu      | Giải thích                                      |
| ----------------- | --------- | ----------------------------------------------- |
| `yearMonth`       | string    | Format `YYYY-MM` — trùng với document ID        |
| `year`            | number    | Năm integer — để query `where("year", "==", x)` |
| `month`           | number    | Tháng 1–12                                      |
| `quarter`         | number    | Quý 1–4 — để filter `where("quarter", "==", x)` |
| `branchId`        | string    | ID chi nhánh                                    |
| `totalRevenue`    | number    | Tổng doanh thu trong tháng (VNĐ)                |
| `totalCost`       | number    | Tổng giá vốn trong tháng (VNĐ)                  |
| `totalProfit`     | number    | Lợi nhuận gộp trong tháng (VNĐ)                 |
| `totalOrders`     | number    | Tổng số đơn trong tháng                         |
| `totalItems`      | number    | Tổng số lượng sản phẩm bán ra                   |
| `cashRevenue`     | number    | Doanh thu tiền mặt (VNĐ)                        |
| `cardRevenue`     | number    | Doanh thu thẻ (VNĐ)                             |
| `transferRevenue` | number    | Doanh thu chuyển khoản (VNĐ)                    |
| `updatedAt`       | Timestamp | Lần cập nhật cuối                               |

```ts
interface MonthlyStatsDoc {
  yearMonth: string; // "2024-01" — document ID
  year: number; // 2024
  month: number; // 1–12
  quarter: number; // 1–4
  branchId: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalItems: number;
  cashRevenue: number;
  cardRevenue: number;
  transferRevenue: number;
  updatedAt: Timestamp;
}
```

---

#### Mapping biểu đồ → stats collection

| Loại biểu đồ              | Docs cần đọc (1 chi nhánh) | Collection dùng                                        |
| ------------------------- | -------------------------- | ------------------------------------------------------ |
| Tuần (7 ngày)             | 7 docs                     | `daily_stats`                                          |
| Tháng (30 ngày)           | ≤31 docs                   | `daily_stats`                                          |
| Quý (3 tháng)             | 3 docs                     | `monthly_stats`                                        |
| Năm (12 tháng)            | 12 docs                    | `monthly_stats`                                        |
| Nhiều năm                 | N×12 docs                  | `monthly_stats`                                        |
| Tất cả chi nhánh theo năm | N_branches × 12 docs       | `monthly_stats` (query từng branch, merge client-side) |

---

#### Atomic pattern khi tạo POS transaction

> ⚠️ **BẮT BUỘC dùng Firestore `runTransaction` (không phải `writeBatch`)** vì cần đọc `batch.quantity` trước khi ghi để đảm bảo không oversell.

```ts
await runTransaction(db, async (tx) => {
  // 1. Đọc và kiểm tra tồn kho
  const batchSnap = await tx.get(batchRef);
  if (batchSnap.data().quantity < totalQty) throw new Error("Không đủ hàng");

  // 2. Ghi POS transaction
  tx.set(txRef, posTransactionDoc);

  // 3. Giảm tồn kho
  tx.update(batchRef, { quantity: increment(-totalQty) });
  tx.update(inventoryRef, { quantity: increment(-totalQty) });

  // 4. Tạo stock_movement
  tx.set(movementRef, stockMovementDoc);

  // 5. Cập nhật daily_stats và monthly_stats (cùng 1 transaction)
  tx.set(dailyRef, { totalRevenue: increment(revenue), totalCost: increment(cost), ... }, { merge: true });
  tx.set(monthlyRef, { totalRevenue: increment(revenue), totalCost: increment(cost), ... }, { merge: true });
});
```

---

## Phân quyền theo Role

| Collection                    | `warehouse_manager` | `branch`                                                                |
| ----------------------------- | ------------------- | ----------------------------------------------------------------------- |
| `users`                       | Read/Write tất cả   | Read/Write của chính mình                                               |
| `medicines`                   | Read/Write          | Read only                                                               |
| `inventory`                   | Read/Write tất cả   | Read: `locationId == branchId`                                          |
| `batches`                     | Read/Write tất cả   | Read: `locationId == branchId`                                          |
| `suppliers`                   | Read/Write          | Không truy cập                                                          |
| `units`                       | Read/Write          | Read only                                                               |
| `import_orders`               | Read/Write tất cả   | Không truy cập                                                          |
| `dispatch_orders`             | Read/Write tất cả   | Read: `toLocationId == branchId`; Write: update `status` → `"received"` |
| `import_requests`             | Read/Write tất cả   | Read/Write: `branchId == mình`                                          |
| `pos_transactions`            | Read tất cả         | Read/Write: `branchId == mình`                                          |
| `branches/{id}/daily_stats`   | Read/Write tất cả   | Read/Write của chi nhánh mình                                           |
| `branches/{id}/monthly_stats` | Read/Write tất cả   | Read/Write của chi nhánh mình                                           |

---

## Indexing gợi ý (Firestore Composite Indexes)

| Collection                    | Fields                                         |
| ----------------------------- | ---------------------------------------------- |
| `inventory`                   | `locationId ASC`, `medicineId ASC`             |
| `inventory`                   | `locationId ASC`, `quantity ASC`               |
| `batches`                     | `locationId ASC`, `expiryDate ASC`             |
| `batches`                     | `medicineId ASC`, `locationId ASC`             |
| `dispatch_orders`             | `toLocationId ASC`, `createdAt DESC`           |
| `dispatch_orders`             | `status ASC`, `createdAt DESC`                 |
| `import_requests`             | `branchId ASC`, `status ASC`, `createdAt DESC` |
| `pos_transactions`            | `branchId ASC`, `createdAt DESC`               |
| `branches/{id}/daily_stats`   | `year ASC`, `month ASC`                        |
| `branches/{id}/daily_stats`   | `year ASC`, `week ASC`                         |
| `branches/{id}/monthly_stats` | `year ASC`, `month ASC`                        |
| `branches/{id}/monthly_stats` | `year ASC`, `quarter ASC`                      |
