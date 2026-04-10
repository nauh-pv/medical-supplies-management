import { useState } from "react";
import { DrugRequestRow } from "./DrugRequestRow";
import type { DrugRow } from "./DrugRequestRow";

const DRUGS = [
  {
    name: "Amoxicillin 500mg (Tồn: 450)",
    category: "Kháng sinh • Hộp 100 viên",
    unit: "Hộp",
    unitPrice: "155.000đ",
    icon: "pill",
  },
  {
    name: "Paracetamol 500mg (Tồn: 1200)",
    category: "Giảm đau hạ sốt • Hộp 200 viên",
    unit: "Vỉ",
    unitPrice: "85.000đ",
    icon: "vaccines",
  },
  {
    name: "Ibuprofen 400mg (Tồn: 80)",
    category: "Kháng viêm • Hộp 100 viên",
    unit: "Hộp",
    unitPrice: "120.000đ",
    icon: "medication",
  },
];

const initialRows: DrugRow[] = [
  { id: 1, ...DRUGS[0], qty: 50 },
  { id: 2, ...DRUGS[1], qty: 100 },
];

const WAREHOUSES = [
  "Kho dược tổng Miền Nam",
  "Kho dược tổng Miền Bắc",
  "Kho dược tổng Miền Trung",
];

const PRIORITIES = [
  { label: "Cao (Trong vòng 24h)", color: "text-tertiary" },
  { label: "Trung bình (2–3 ngày)", color: "text-primary" },
  { label: "Bình thường (1 tuần)", color: "text-on-surface-variant" },
];

export function CreateRequestForm() {
  const [rows, setRows] = useState<DrugRow[]>(initialRows);

  function addRow() {
    const next = DRUGS[rows.length % DRUGS.length];
    setRows((prev) => [...prev, { id: Date.now(), ...next, qty: 1 }]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function changeQty(id: number, val: number) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, qty: Math.max(1, val) } : r)),
    );
  }

  const totalTypes = rows.length;

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="bg-primary rounded-full p-8 text-on-primary shadow-[0_20px_40px_rgba(0,80,203,0.25)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex-1 relative z-10">
          <h3 className="text-xl font-headline font-bold mb-2">
            Gửi yêu cầu ngay
          </h3>
          <p className="text-sm leading-relaxed opacity-90 max-w-2xl">
            Vui lòng kiểm tra kỹ danh sách thuốc và số lượng trước khi xác nhận
            gửi về Kho tổng. Lệnh yêu cầu sau khi gửi sẽ không thể chỉnh sửa.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <button className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-container-low transition-all flex items-center gap-2 whitespace-nowrap shadow-lg">
            <span className="material-symbols-outlined">send</span>
            Gửi yêu cầu nhập hàng
          </button>
        </div>
      </div>

      {/* Info section */}
      <section className="bg-surface-container-lowest p-8 rounded-full shadow-[0_20px_40px_rgba(0,80,203,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
        <h3 className="text-lg font-headline font-bold mb-6 flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary">info</span>
          Thông tin chung
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Warehouse select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Kho nguồn (Tổng)
            </label>
            <div className="relative">
              <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                {WAREHOUSES.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">
                expand_more
              </span>
            </div>
          </div>

          {/* Priority select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Mức độ ưu tiên
            </label>
            <div className="relative">
              <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                {PRIORITIES.map((p) => (
                  <option key={p.label}>{p.label}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Drug selection section */}
      <section className="bg-surface-container-lowest p-8 rounded-full shadow-[0_20px_40px_rgba(0,80,203,0.06)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-headline font-bold flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary">
              medication
            </span>
            Danh mục thuốc yêu cầu
          </h3>
          <button
            type="button"
            onClick={addRow}
            className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm thuốc
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <DrugRequestRow
              key={row.id}
              row={row}
              drugs={DRUGS}
              onQtyChange={changeQty}
              onRemove={removeRow}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 pt-8 border-t border-dashed border-outline-variant/30 flex flex-col gap-3">
          <div className="flex justify-between items-center text-on-surface-variant text-sm">
            <span>Số lượng loại thuốc:</span>
            <span className="font-bold text-on-surface">
              {String(totalTypes).padStart(2, "0")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-headline font-bold text-on-surface">
              Tổng giá trị ước tính:
            </span>
            <span className="text-xl font-headline font-extrabold text-primary">
              16.250.000đ
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
