import { useState } from "react";
import { Button } from "@/components/common";

interface ProductRow {
  id: number;
  name: string;
  sku: string;
  lot: string;
  stock: number;
  unit: string;
  qty: number;
}

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
  {
    id: 1,
    ...AVAILABLE_PRODUCTS[0],
    qty: 100,
  },
  {
    id: 2,
    ...AVAILABLE_PRODUCTS[1],
    qty: 20,
  },
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
        <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-surface-container">
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

          <div className="space-y-8">
            {/* Branch select */}
            <div className="space-y-2">
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                Chi nhánh nhận thuốc
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-xl pointer-events-none">
                  local_hospital
                </span>
                <select className="w-full pl-12 pr-10 py-4 bg-surface-container-low rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
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
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                Danh mục thuốc &amp; Vật tư
              </label>

              {/* Dropdown to pick medicine */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-xl pointer-events-none">
                  inventory
                </span>
                <select className="w-full pl-12 pr-10 py-4 bg-surface-container-low rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
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
              <div className="overflow-hidden rounded-xl border border-outline-variant/10">
                {/* Header */}
                <div className="grid grid-cols-12 px-5 py-3 bg-surface-container-low text-[10px] font-label font-black uppercase tracking-widest text-on-surface-variant">
                  <div className="col-span-6">Tên sản phẩm / SKU</div>
                  <div className="col-span-2 text-center">Tồn kho</div>
                  <div className="col-span-3 text-center">Số lượng xuất</div>
                  <div className="col-span-1" />
                </div>

                {rows.map((row, i) => (
                  <div
                    key={row.id}
                    className={[
                      "grid grid-cols-12 px-5 py-4 items-center border-t border-outline-variant/10",
                      i % 2 === 1
                        ? "bg-surface-container-low/30"
                        : "bg-surface-container-lowest",
                    ].join(" ")}
                  >
                    {/* Name + SKU */}
                    <div className="col-span-6">
                      <p className="font-bold text-sm text-on-surface">
                        {row.name}
                      </p>
                      <p className="text-[10px] text-on-surface-variant uppercase font-medium mt-0.5">
                        SKU: {row.sku} | Lô: {row.lot}
                      </p>
                    </div>

                    {/* Stock */}
                    <div className="col-span-2 text-center text-sm font-semibold text-on-surface-variant">
                      {row.stock.toLocaleString()}{" "}
                      <span className="text-[10px] font-normal">
                        {row.unit}
                      </span>
                    </div>

                    {/* Qty stepper */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center bg-surface-container rounded-full px-1 py-1 gap-1">
                        <button
                          onClick={() => updateQty(row.id, -1)}
                          type="button"
                          className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container-lowest rounded-full transition-all font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="w-14 bg-transparent border-none text-center font-bold text-sm focus:ring-0 outline-none"
                          value={row.qty}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      qty: Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                      ),
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                        <button
                          onClick={() => updateQty(row.id, 1)}
                          type="button"
                          className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container-lowest rounded-full transition-all font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeRow(row.id)}
                        type="button"
                        className="p-2 text-on-surface-variant/30 hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add more */}
              <button
                type="button"
                onClick={addRow}
                className="w-full py-4 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group"
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
                  add_circle
                </span>
                <span className="text-sm font-bold">
                  Thêm thuốc khác vào danh sách
                </span>
              </button>
            </div>

            {/* Footer actions */}
            <div className="pt-6 border-t border-surface-container flex items-center justify-between">
              <p className="text-xs text-on-surface-variant italic">
                * Lệnh xuất kho sẽ được gửi đến bộ phận kiểm kê để xác nhận.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" type="button" onClick={onCancel}>
                  Hủy bỏ
                </Button>
                <Button type="submit">Tạo lệnh xuất kho</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Summary card ── */}
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-primary rounded-[1.5rem] p-8 text-on-primary shadow-[0_20px_40px_rgba(0,80,203,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <h4 className="text-xs font-label font-bold uppercase tracking-[0.2em] opacity-80 mb-6">
            Tóm tắt lệnh xuất
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-sm opacity-90">Tổng số loại thuốc:</span>
              <span className="text-2xl font-headline font-bold">
                {String(totalTypes).padStart(2, "0")}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-sm opacity-90">Tổng số lượng (đv):</span>
              <span className="text-2xl font-headline font-bold">
                {totalQty.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Trọng lượng dự kiến:</span>
              <span className="text-2xl font-headline font-bold">
                — <span className="text-xs font-normal opacity-70">kg</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
