---
name: msm-patterns
description: Reusable coding patterns for Medical Supplies Management. Firebase queries, useState/useEffect data loading, form handling, delete confirmation, pagination, loading states, and filter patterns. Reference during coding to follow established conventions.
---

# MSM – Coding Patterns

---

## 📡 Data Loading Pattern (Standard)

The standard pattern used across all feature tables (SupplierTable, UnitTable, BranchTable…):

```tsx
export function FeatureTable() {
  const [items, setItems] = useState<FeatureDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await getFeatureItems();
      setItems(data);
    } catch (err) {
      console.error("FeatureTable fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ... render
}
```

**Rules:**

- Always show a spinner while loading: `<span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>`
- Always use `try/finally` so `setLoading(false)` always runs
- Call the loader function `loadItems()` — never inline fetch in `useEffect`

---

## 🔍 Search + Pagination Pattern

```tsx
const ITEMS_PER_PAGE = 6;
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);

const filtered = items.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase()) ||
  item.code.toLowerCase().includes(search.toLowerCase())
);
const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

// Reset to page 1 when search changes
onChange={(e) => { setSearch(e.target.value); setPage(1); }}
```

---

## 📝 Form Handling Pattern

```tsx
interface FeatureForm {
  name: string;
  phone: string;
}

const EMPTY_FORM: FeatureForm = { name: "", phone: "" };

const [form, setForm] = useState<FeatureForm>(EMPTY_FORM);
const [saving, setSaving] = useState(false);

// Partial update helper
setForm((f) => ({ ...f, name: e.target.value }));

// Submit handler
async function handleAdd(e: React.FormEvent) {
  e.preventDefault();
  if (!form.name.trim()) return;
  setSaving(true);
  try {
    await addFeatureItem(form.name.trim(), form.phone.trim());
    setForm(EMPTY_FORM);
    setAddOpen(false);
    await loadItems();
  } finally {
    setSaving(false);
  }
}
```

**Rules:**

- Always call `.trim()` on string inputs before writing to Firestore
- Disable submit button while `saving` is true
- Reset form to `EMPTY_FORM` after successful save

---

## 🗑️ Delete Confirmation Pattern (Modal — NOT window.confirm)

```tsx
const [deleteTarget, setDeleteTarget] = useState<FeatureDoc | null>(null);
const [deleting, setDeleting] = useState(false);

async function confirmDelete() {
  if (!deleteTarget) return;
  setDeleting(true);
  try {
    await deleteFeatureItem(deleteTarget.id);
    setDeleteTarget(null);
    await loadItems();
  } finally {
    setDeleting(false);
  }
}

// In JSX:
<button onClick={() => setDeleteTarget(item)} ...>
  <span className="material-symbols-outlined">delete</span>
</button>

<Modal
  open={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  title="Xác nhận xóa"
  maxWidth="max-w-md"
>
  <div className="px-10 py-8 space-y-6">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-error-container/50 flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-error">delete_forever</span>
      </div>
      <p className="text-sm text-on-surface-variant">
        Bạn có chắc chắn muốn xóa <span className="font-bold text-on-surface">{deleteTarget?.name}</span>?
      </p>
    </div>
    <div className="flex gap-3">
      <button type="button" onClick={() => setDeleteTarget(null)}
        className="flex-1 py-3 rounded-xl text-sm font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-colors">
        Hủy bỏ
      </button>
      <button type="button" onClick={confirmDelete} disabled={deleting}
        className="flex-1 py-3 rounded-xl text-sm font-semibold text-on-primary bg-error hover:opacity-90 transition-opacity disabled:opacity-60">
        {deleting ? "Đang xóa..." : "Xóa"}
      </button>
    </div>
  </div>
</Modal>
```

---

## ✏️ Edit Modal Pattern

```tsx
const [editItem, setEditItem] = useState<FeatureDoc | null>(null);

function openEdit(item: FeatureDoc) {
  setEditItem(item);
  setForm({ name: item.name, phone: item.phone });
}

async function handleEdit(e: React.FormEvent) {
  e.preventDefault();
  if (!editItem) return;
  setSaving(true);
  try {
    await updateFeatureItem(editItem.id, { name: form.name.trim() });
    setEditItem(null);
    setForm(EMPTY_FORM);
    await loadItems();
  } finally {
    setSaving(false);
  }
}

// Close handler always resets form
onClose={() => { setEditItem(null); setForm(EMPTY_FORM); }}
```

---

## 📊 Stats Loading Pattern (Dashboard/Reports)

```tsx
const [stats, setStats] = useState<StatsType | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function load() {
    setLoading(true);
    try {
      const data = await getStats(branchId, dateRange);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  load();
}, [branchId, dateRange]); // Re-fetch when filters change
```

---

## 🔄 Refetch Trigger Pattern (Cross-component refresh)

Used when a child modal creates data and the parent table needs to re-fetch:

```tsx
// In parent page:
const [refetchTrigger, setRefetchTrigger] = useState(0);

<InventoryTable refetchTrigger={refetchTrigger} />
<AddMedicineModal
  onSuccess={() => {
    setAddOpen(false);
    setRefetchTrigger(n => n + 1);
  }}
/>

// In child table:
useEffect(() => {
  loadItems();
}, [refetchTrigger]);
```

---

## ⏱️ Loading Spinner (Standard)

```tsx
{
  loading && (
    <div className="flex items-center justify-center py-16 text-on-surface-variant gap-3">
      <span className="material-symbols-outlined animate-spin text-primary text-3xl">
        progress_activity
      </span>
      <span className="text-sm">Đang tải...</span>
    </div>
  );
}
```

---

## 🎨 Table Structure Pattern

```tsx
<div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
  {/* Filter bar */}
  <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
    <Input leadingIcon="search" placeholder="Tìm kiếm..." value={search} onChange={...} />
    <Button icon="add" onClick={() => setAddOpen(true)}>Thêm mới</Button>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-surface-container-low border-b border-outline-variant/10">
          <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tên</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/10">
        {paged.map((item, i) => (
          <tr key={item.id} className="hover:bg-surface-bright transition-colors">
            <td className="px-6 py-5 font-bold text-on-surface">{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination footer */}
  <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
    <p className="text-sm text-on-surface-variant">
      Hiển thị <span className="font-bold text-on-surface">{paged.length}</span> của {filtered.length}
    </p>
    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
  </div>
</div>
```

---

## 🏷️ Code/ID Badge Pattern

```tsx
<span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
  {item.code}
</span>
```

---

## 🔒 Role-Based Rendering Pattern

```tsx
import { useUser } from "@/contexts/UserContext";

const { user } = useUser();
const isWarehouseManager = user?.role === "warehouse_manager";

{isWarehouseManager && (
  <Button icon="add" onClick={...}>Thêm mới</Button>
)}
```
