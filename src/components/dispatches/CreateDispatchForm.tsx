import { useState } from "react";
import { DispatchProductRow } from "./DispatchProductRow";
import type { ProductRow } from "./DispatchProductRow";

const AVAILABLE_PRODUCTS = [
  {
    name: "Paracetamol 500mg - Vỉ 10 viên",
    sku: "MED-PARA-500",
    lot: "#2024-X1",
    stock: 1240,
    unit: "vỉ",
  },
  {
    name: "Amoxicillin 250mg - Hộp 100 viên",
    sku: "AB-AMOX-250",
    lot: "#2024-K2",
    stock: 450,
    unit: "hộp",
  },
  {
    name: "Vitamin C 1000mg - Tuýp 20 viên",
    sku: "VIT-C-1000",
    lot: "#2024-M3",
    stock: 800,
    unit: "tuýp",
  },
  {
    name: "Augmentin 625mg - Vỉ 14 viên",
    sku: "AUG-625",
    lot: "#2024-P4",
    stock: 120,
    unit: "vỉ",
  },
];

const BRANCHES = [
  "Bệnh viện Đa khoa Tâm Anh",
  "Hệ thống Nhà thuốc Pharmacity - CN Quận 1",
  "Bệnh viện Chợ Rẫy - Kho Dược A",
  "Chi nhánh phân phối miền Tây",
];

const initialRows: ProductRow[] = [
  { id: 1, ...AVAILABLE_PRODUCTS[0], qty: 100 },
  { id: 2, ...AVAILABLE_PRODUCTS[1], qty: 20 },
];

export function CreateDispatchForm({ onCancel }: { onCancel: () => void }) {
  const [rows, setRows] = useState<ProductRow[]>(initialRows);

  function updateQty(id: number, delta: number) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, qty: Math.max(1, r.qty + delta) } : r,
      ),
    );
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function addRow() {
    const next = AVAILABLE_PRODUCTS[rows.length % AVAILABLE_PRODUCTS.length];
    setRows((prev) => [...prev, { id: Date.now(), ...next, qty: 1 }]);
  }

  const totalTypes = rows.length;
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* ── Left: Form ── */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <section className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b border-surface-container pb-4">
            <h3 className="text-xl font-headline font-bold text-on-surface">
              Thông tin lệnh xuất
            </h3>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">info</span>
              <span className="text-xs font-label font-bold uppercase tracking-widest">
                Mã số tự động
              </span>
            </div>
          </div>

          <form className="space-y-8">
            {/* Branch select */}
            <div className="space-y-3">
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant block ml-1">
                Chi nhánh nhận thuốc
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors pointer-events-none">
                  local_hospital
                </span>
                <select className="w-full pl-12 pr-4 py-4 bg-surface-container-high/40 border-none rounded-full focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[0_4px_20px_rgba(0,80,203,0.08)] transition-all appearance-none cursor-pointer text-on-surface font-medium text-sm outline-none">
                  <option value="">
                    Chọn chi nhánh bệnh viện / nhà thuốc...
                  </option>
                  {BRANCHES.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Product section */}
            <div className="space-y-4">
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant block ml-1">
                Danh mục thuốc &amp; Vật tư
              </label>

              {/* Medicine dropdown */}
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors pointer-events-none">
                  inventory
                </span>
                <select className="w-full pl-12 pr-10 py-4 bg-surface-container-high/40 border-none rounded-full focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[0_4px_20px_rgba(0,80,203,0.08)] transition-all appearance-none cursor-pointer text-on-surface font-medium text-sm outline-none">
                  <option value="">Chọn thuốc từ danh mục tồn kho...</option>
                  {AVAILABLE_PRODUCTS.map((p) => (
                    <option key={p.sku}>
                      {p.name} (Tồn: {p.stock.toLocaleString()})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Rows table */}
              <div className="mt-6 space-y-2 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 px-6 py-2 bg-surface-container-low rounded-t-xl text-[10px] font-label font-black uppercase tracking-widest text-on-surface-variant">
                  <div className="col-span-6">Tên sản phẩm / SKU</div>
                  <div className="col-span-2 text-center">Tồn kho</div>
                  <div className="col-span-3 text-center">Số lượng xuất</div>
                  <div className="col-span-1" />
                </div>

                {rows.map((row, i) => (
                  <DispatchProductRow
                    key={row.id}
                    row={row}
                    index={i}
                    onQtyChange={updateQty}
                    onQtyInput={(id, val) =>
                      setRows((prev) =>
                        prev.map((r) => (r.id === id ? { ...r, qty: val } : r)),
                      )
                    }
                    onRemove={removeRow}
                  />
                ))}
              </div>

              {/* Add more */}
              <button
                type="button"
                onClick={addRow}
                className="w-full py-4 border-2 border-dashed border-outline-variant rounded-full text-on-surface-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group mt-4"
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  add_circle
                </span>
                <span className="text-sm font-bold">
                  Thêm thuốc khác vào danh sách
                </span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-surface-container flex items-center justify-between">
              <p className="text-sm text-on-surface-variant italic">
                * Lệnh xuất kho sẽ được gửi đến bộ phận kiểm kê để xác nhận.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-3 rounded-full text-on-surface-variant font-bold hover:bg-surface-container transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-10 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Tạo lệnh xuất kho
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>

      {/* ── Right: Summary card ── */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-primary rounded-[2rem] p-8 text-on-primary shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <h4 className="text-xs font-label font-bold uppercase tracking-[0.2em] opacity-80 mb-6">
            Tóm tắt lệnh xuất
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-sm opacity-90">Tổng số loại thuốc:</span>
              <span className="text-xl font-bold">
                {String(totalTypes).padStart(2, "0")}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-sm opacity-90">Tổng số lượng (đv):</span>
              <span className="text-xl font-bold">
                {totalQty.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Trọng lượng dự kiến:</span>
              <span className="text-xl font-bold">
                4.2 <span className="text-xs">kg</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
