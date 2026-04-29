---
applyTo: "src/**/*.{tsx,ts}"
---

# Analytics & Chart Data Pattern — Medical Supplies Management

> **TRẠNG THÁI HIỆN TẠI:** `daily_stats` đang được ghi với schema **đơn giản hóa**. Schema đầy đủ (totalCost, totalProfit, year, month…) **chưa được implement** — xem ghi chú bên dưới.

> **RULES (enforce every time):**
>
> 1. **Không bao giờ query `pos_transactions` để vẽ biểu đồ.** Luôn đọc `daily_stats` hoặc `monthly_stats`.
> 2. Khi tạo POS transaction, **bắt buộc** cập nhật `daily_stats` trong cùng 1 `runTransaction`.
> 3. Document ID của `daily_stats` luôn là `YYYY-MM-DD`.

---

## Kiến trúc tổng quan

```
pos_transactions/{txId}                         ← raw data, dùng để xem chi tiết hoá đơn
branches/{branchId}/daily_stats/{YYYY-MM-DD}    ← aggregate theo ngày, dùng cho biểu đồ tuần/tháng
branches/{branchId}/monthly_stats/{YYYY-MM}     ← aggregate theo tháng, dùng cho biểu đồ quý/năm
```

### Tại sao không query thẳng `pos_transactions`?

| Kịch bản                   | Query `pos_transactions`                   | Query stats            |
| -------------------------- | ------------------------------------------ | ---------------------- |
| Biểu đồ tuần (7 ngày)      | Scan tất cả đơn trong 7 ngày của chi nhánh | Đọc đúng 7 documents   |
| Biểu đồ tháng (30 ngày)    | Scan ~500–3000 đơn/tháng                   | Đọc đúng ≤31 documents |
| Biểu đồ năm (12 tháng)     | Scan ~6000–36000 đơn/năm                   | Đọc đúng 12 documents  |
| Dashboard tất cả chi nhánh | Scan hàng chục nghìn đơn                   | Đọc N×12 documents     |

---

## Mapping: loại biểu đồ → collection → query

### Biểu đồ theo tuần (7 ngày gần nhất)

```ts
// Lấy 7 ngày: từ 6 ngày trước đến hôm nay
const today = new Date();
const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - (6 - i));
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
});

// Query: lấy daily_stats của từng ngày (dùng Promise.all)
const snapshots = await Promise.all(
  days.map((date) =>
    getDoc(doc(db, `branches/${branchId}/daily_stats/${date}`)),
  ),
);

const chartData = days.map((date, i) => ({
  label: date.slice(5), // "MM-DD"
  revenue: snapshots[i].exists() ? snapshots[i].data().totalRevenue : 0,
  profit: snapshots[i].exists() ? snapshots[i].data().totalProfit : 0,
}));
```

> ⚠️ Các ví dụ query bên dưới dùng field `totalRevenue`, `totalProfit`, `year`, `month` — những field này **chưa có** cho đến khi `pos.ts` được update để ghi schema đầy đủ. (tháng hiện tại — từng ngày)

```ts
// Lấy tất cả daily_stats của tháng hiện tại
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

const q = query(
  collection(db, `branches/${branchId}/daily_stats`),
  where("year", "==", year),
  where("month", "==", month),
  orderBy("date", "asc"),
);

const snap = await getDocs(q);
const chartData = snap.docs.map((d) => ({
  label: d.data().date.slice(8), // ngày trong tháng: "01"–"31"
  revenue: d.data().totalRevenue,
  profit: d.data().totalProfit,
  orders: d.data().totalOrders,
}));
```

---

### Biểu đồ theo quý (3 tháng trong quý)

```ts
// Ví dụ: Quý 2 năm 2024 → tháng 4, 5, 6
const quarterMonths: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
};

const q = query(
  collection(db, `branches/${branchId}/monthly_stats`),
  where("year", "==", selectedYear),
  where("quarter", "==", selectedQuarter),
  orderBy("month", "asc"),
);

const snap = await getDocs(q);
const chartData = snap.docs.map((d) => ({
  label: `T${d.data().month}`,
  revenue: d.data().totalRevenue,
  profit: d.data().totalProfit,
  orders: d.data().totalOrders,
}));
```

---

### Biểu đồ theo năm (12 tháng)

```ts
const q = query(
  collection(db, `branches/${branchId}/monthly_stats`),
  where("year", "==", selectedYear),
  orderBy("month", "asc"),
);

const snap = await getDocs(q);

// Đảm bảo đủ 12 điểm dù tháng chưa có data
const chartData = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const found = snap.docs.find((d) => d.data().month === month);
  return {
    label: `T${month}`,
    revenue: found ? found.data().totalRevenue : 0,
    profit: found ? found.data().totalProfit : 0,
    orders: found ? found.data().totalOrders : 0,
  };
});
```

---

### Biểu đồ so sánh nhiều năm

```ts
// So sánh doanh thu năm 2023 vs 2024 vs 2025
const years = [2023, 2024, 2025];

const allData = await Promise.all(
  years.map(async (year) => {
    const q = query(
      collection(db, `branches/${branchId}/monthly_stats`),
      where("year", "==", year),
      orderBy("month", "asc"),
    );
    const snap = await getDocs(q);
    return { year, docs: snap.docs };
  }),
);

// chartData[i] = { month: 1–12, revenue_2023, revenue_2024, revenue_2025 }
const chartData = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const point: Record<string, number> = { month };
  allData.forEach(({ year, docs }) => {
    const found = docs.find((d) => d.data().month === month);
    point[`revenue_${year}`] = found ? found.data().totalRevenue : 0;
  });
  return point;
});
```

---

### Dashboard tổng hợp tất cả chi nhánh (warehouse_manager)

```ts
// Doanh thu tháng này của tất cả chi nhánh
const branchIds = ["CN001", "CN002", "CN003"]; // lấy từ branches collection
const yearMonth = "2024-06"; // YYYY-MM

const allStats = await Promise.all(
  branchIds.map((branchId) =>
    getDoc(doc(db, `branches/${branchId}/monthly_stats/${yearMonth}`)),
  ),
);

const summary = branchIds.map((branchId, i) => ({
  branchId,
  revenue: allStats[i].exists() ? allStats[i].data().totalRevenue : 0,
  profit: allStats[i].exists() ? allStats[i].data().totalProfit : 0,
}));
```

---

## Cách ghi stats khi tạo POS transaction

> ⚠️ **TRẠNG THÁI HIỆN TẠI (đã implement):** `pos.ts` chỉ ghi schema đơn giản vào `daily_stats`:
>
> ```ts
> // Schema đang được ghi (simplified — src/services/pos.ts)
> tx.set(statsRef, {
>   date: today, // "YYYY-MM-DD"
>   branchId,
>   revenue: total, // ← tên field khác với spec phía dưới
>   txCount: 1,
> });
> // On update: { revenue: increment(total), txCount: increment(1) }
> ```
>
> `monthly_stats` **chưa được ghi** ở bất kỳ đâu.
>
> **Để implement đầy đủ analytics**, cần update `pos.ts` để ghi đúng schema dưới đây.

---

### Schema đầy đủ (cần implement)

```ts
import {
  runTransaction,
  doc,
  collection,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { getISOWeek } from "date-fns"; // hoặc tự tính

async function createPosTransaction(
  branchId: string,
  txData: PosTransactionDoc,
) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const yearMonth = now.toISOString().slice(0, 7); // "YYYY-MM"
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const week = getISOWeek(now); // 1–53
  const quarter = Math.ceil(month / 3); // 1–4

  // Tính cost từ batch.importPrice (đọc trước khi vào transaction)
  const totalCost = txData.items.reduce((sum, item) => {
    // item.importPrice phải được resolve trước từ batch document
    return sum + item.importPrice * item.quantity;
  }, 0);
  const totalProfit = txData.total - totalCost;

  const txRef = doc(collection(db, "pos_transactions"));
  const batchRef = doc(db, `batches/${txData.items[0].batchId}`); // lặp cho multi-item
  const inventoryRef = doc(db, `inventory/${inventoryId}`);
  const dailyRef = doc(db, `branches/${branchId}/daily_stats/${dateStr}`);
  const monthlyRef = doc(db, `branches/${branchId}/monthly_stats/${yearMonth}`);

  await runTransaction(db, async (tx) => {
    // 1. Kiểm tra tồn kho (đọc trước khi ghi)
    for (const item of txData.items) {
      const bSnap = await tx.get(doc(db, `batches/${item.batchId}`));
      if (!bSnap.exists() || bSnap.data().quantity < item.quantity) {
        throw new Error(`Không đủ hàng: ${item.medicineName}`);
      }
    }

    // 2. Ghi POS transaction
    tx.set(txRef, { ...txData, id: txRef.id, createdAt: serverTimestamp() });

    // 3. Giảm tồn kho từng item
    for (const item of txData.items) {
      tx.update(doc(db, `batches/${item.batchId}`), {
        quantity: increment(-item.quantity),
      });
      tx.update(doc(db, `inventory/${item.inventoryId}`), {
        quantity: increment(-item.quantity),
        updatedAt: serverTimestamp(),
      });
    }

    // 4. Cập nhật daily_stats (merge: true → tự tạo nếu chưa có)
    const dailyPaymentField =
      txData.paymentMethod === "cash"
        ? "cashRevenue"
        : txData.paymentMethod === "card"
          ? "cardRevenue"
          : "transferRevenue";

    tx.set(
      dailyRef,
      {
        date: dateStr,
        year,
        month,
        week,
        branchId,
        totalRevenue: increment(txData.total),
        totalCost: increment(totalCost),
        totalProfit: increment(totalProfit),
        totalOrders: increment(1),
        totalItems: increment(txData.items.reduce((s, i) => s + i.quantity, 0)),
        [dailyPaymentField]: increment(txData.total),
        cashRevenue: increment(
          txData.paymentMethod === "cash" ? txData.total : 0,
        ),
        cardRevenue: increment(
          txData.paymentMethod === "card" ? txData.total : 0,
        ),
        transferRevenue: increment(
          txData.paymentMethod === "transfer" ? txData.total : 0,
        ),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    // 6. Cập nhật monthly_stats (merge: true → tự tạo nếu chưa có)
    tx.set(
      monthlyRef,
      {
        yearMonth,
        year,
        month,
        quarter,
        branchId,
        totalRevenue: increment(txData.total),
        totalCost: increment(totalCost),
        totalProfit: increment(totalProfit),
        totalOrders: increment(1),
        totalItems: increment(txData.items.reduce((s, i) => s + i.quantity, 0)),
        cashRevenue: increment(
          txData.paymentMethod === "cash" ? txData.total : 0,
        ),
        cardRevenue: increment(
          txData.paymentMethod === "card" ? txData.total : 0,
        ),
        transferRevenue: increment(
          txData.paymentMethod === "transfer" ? txData.total : 0,
        ),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
}
```

---

## Helpers hữu ích

```ts
// Tính ISO week number (không cần thư viện)
function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Format cho document ID
const toDailyId = (date: Date) => date.toISOString().slice(0, 10); // "2024-06-15"
const toMonthlyId = (date: Date) => date.toISOString().slice(0, 7); // "2024-06"
const toQuarter = (month: number) => Math.ceil(month / 3); // 1–4
```

---

## Lưu ý quan trọng

| Tình huống                       | Cách xử lý                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Huỷ/hoàn đơn POS                 | Phải `decrement` lại stats trong 1 transaction (không xoá transaction gốc)         |
| Điều chỉnh thủ công tồn kho      | **Không** ảnh hưởng stats — chỉ ghi `stock_movement` type `adjustment`             |
| Chi nhánh mới, chưa có stats doc | `merge: true` tự tạo document — không cần khởi tạo trước                           |
| Rebuild stats khi bị lỗi         | Chạy script aggregate lại từ `pos_transactions` theo từng ngày/tháng, ghi đè stats |
