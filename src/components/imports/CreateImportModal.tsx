import { useState, useEffect } from "react";
import { Modal, Button } from "@/components/common";
import {
  getMedicines,
  getSuppliers,
  createImportOrder,
} from "@/services/inventory";
import type { MedicineDoc, SupplierDoc } from "@/types/firestore";
import { useUserContext } from "@/contexts/UserContext";

interface ImportRow {
  id: number;
  medicineId: string;
  medicineName: string;
  medicineSku: string;
  unitId: string;
  unitName: string;
  lot: string;
  qty: number;
  unitPrice: number;
  expiryDate: string; // "YYYY-MM-DD"
}

function generateLot(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return `${dd}${mm}${yyyy}-${rand}`;
}

function makeRow(id: number): ImportRow {
  return {
    id,
    medicineId: "",
    medicineName: "",
    medicineSku: "",
    unitId: "",
    unitName: "",
    lot: generateLot(),
    qty: 1,
    unitPrice: 0,
    expiryDate: "",
  };
}

interface CreateImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateImportModal({
  open,
  onClose,
  onSuccess,
}: CreateImportModalProps) {
  const userDoc = useUserContext();
  const [medicines, setMedicines] = useState<MedicineDoc[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDoc[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([makeRow(1)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load lists when modal opens
  useEffect(() => {
    if (!open) return;
    setSupplierId("");
    setNotes("");
    setRows([makeRow(1)]);
    setError("");
    Promise.all([getMedicines(), getSuppliers()]).then(([meds, sups]) => {
      setMedicines(meds);
      setSuppliers(sups);
    });
  }, [open]);

  function setRow(id: number, patch: Partial<ImportRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function selectMedicine(rowId: number, medicineId: string) {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;
    setRow(rowId, {
      medicineId: med.id,
      medicineName: med.name,
      medicineSku: med.sku,
      unitId: med.unitId,
      unitName: med.unitName,
      unitPrice: med.importPrice,
    });
  }

  function addRow() {
    setRows((prev) => [...prev, makeRow(Date.now())]);
  }

  function removeRow(id: number) {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );
  }

  const subtotal = rows.reduce((s, r) => s + r.qty * r.unitPrice, 0);
  const total = subtotal;

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  async function handleSubmit() {
    if (!supplierId || !selectedSupplier) {
      setError("Vui lòng chọn nhà cung cấp.");
      return;
    }
    for (const r of rows) {
      if (!r.medicineId) {
        setError("Vui lòng chọn sản phẩm cho tất cả các dòng.");
        return;
      }
      if (!r.lot.trim()) {
        setError("Vui lòng nhập số lô cho tất cả các dòng.");
        return;
      }
      if (!r.expiryDate) {
        setError("Vui lòng nhập hạn sử dụng cho tất cả các dòng.");
        return;
      }
      if (new Date(r.expiryDate) <= new Date()) {
        setError(
          `Hạn dùng của "${r.medicineName || "sản phẩm"}" phải lớn hơn ngày hiện tại.`,
        );
        return;
      }
      if (r.qty <= 0 || r.unitPrice <= 0) {
        setError("Số lượng và đơn giá phải lớn hơn 0.");
        return;
      }
    }
    setError("");
    setSaving(true);
    try {
      await createImportOrder({
        supplierId,
        supplierName: selectedSupplier.name,
        createdBy: userDoc?.uid ?? "unknown",
        createdByName: userDoc?.displayName ?? "Người dùng",
        notes,
        items: rows.map((r) => ({
          medicineId: r.medicineId,
          medicineName: r.medicineName,
          medicineSku: r.medicineSku,
          lot: r.lot.trim().toUpperCase(),
          quantity: r.qty,
          unitId: r.unitId,
          unitName: r.unitName,
          unitPrice: r.unitPrice,
          expiryDate: new Date(r.expiryDate),
        })),
      });
      onSuccess?.();
    } catch (err) {
      console.error("CreateImportModal submit error:", err);
      setError("Đã xảy ra lỗi khi lưu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nhập hàng thủ công"
      subtitle="Tạo đơn nhập kho mới trực tiếp vào kho tổng"
      maxWidth="max-w-5xl"
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              info
            </span>
            <h3 className="font-bold text-on-surface uppercase text-xs tracking-[0.2em] font-headline">
              Thông tin chung
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Nhà cung cấp <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pl-4 pr-10 text-on-surface outline-none"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                >
                  <option value="">Chọn nhà cung cấp...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Người thực hiện
              </label>
              <input
                type="text"
                readOnly
                value={userDoc?.displayName ?? ""}
                className="w-full h-11 bg-surface-container-low/50 border border-outline-variant/20 rounded-xl text-sm px-4 text-on-surface-variant outline-none cursor-default"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Product rows */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">
              inventory_2
            </span>
            <h3 className="font-bold text-on-surface uppercase text-xs tracking-[0.2em] font-headline">
              Danh sách sản phẩm
            </h3>
          </div>

          <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {[
                    { label: "Sản phẩm", w: "" },
                    { label: "Số lượng", w: "w-32 text-left" },
                    { label: "Đơn vị", w: "w-20 text-left" },
                    { label: "Đơn giá", w: "w-32 text-left" },
                    { label: "Hạn dùng", w: "w-36" },
                    { label: "Thành tiền", w: "w-32 text-right" },
                    { label: "", w: "w-10" },
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={[
                        "px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant",
                        h.w,
                      ].join(" ")}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-surface-container-low/30 transition-colors"
                  >
                    {/* Medicine select */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          className="w-full border-none bg-transparent text-sm font-semibold focus:ring-0 appearance-none text-on-surface outline-none pr-5"
                          value={r.medicineId}
                          onChange={(e) => selectMedicine(r.id, e.target.value)}
                        >
                          <option value="">Chọn thuốc...</option>
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">
                          expand_more
                        </span>
                      </div>
                      {r.medicineSku && (
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                          {r.medicineSku}
                        </p>
                      )}
                    </td>
                    {/* Qty */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={r.qty}
                        onChange={(e) =>
                          setRow(r.id, {
                            qty: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-center py-1.5 h-9 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                      />
                    </td>
                    {/* Unit */}
                    <td className="px-4 py-3 text-center text-sm text-on-surface-variant">
                      {r.unitName || "—"}
                    </td>
                    {/* Unit price */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={r.unitPrice}
                        onChange={(e) =>
                          setRow(r.id, { unitPrice: Number(e.target.value) })
                        }
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-right py-1.5 h-9 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                      />
                    </td>
                    {/* Expiry */}
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={r.expiryDate}
                        min={
                          new Date(Date.now() + 86400000)
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={(e) =>
                          setRow(r.id, { expiryDate: e.target.value })
                        }
                        className={[
                          "w-full bg-surface-container-low border rounded-lg text-sm px-2 py-1.5 h-9 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface",
                          r.expiryDate && new Date(r.expiryDate) <= new Date()
                            ? "border-error/60 bg-error/5"
                            : "border-outline-variant/30",
                        ].join(" ")}
                      />
                    </td>
                    {/* Row total */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-on-surface font-mono">
                        {(r.qty * r.unitPrice).toLocaleString("vi-VN")}đ
                      </span>
                    </td>
                    {/* Delete */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(r.id)}
                        className="text-on-surface-variant/40 hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={addRow}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-primary hover:bg-primary/5 active:bg-primary/10 transition-colors border-t border-dashed border-primary/20"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Thêm dòng
            </button>
          </div>
        </section>

        {/* Section 3: Notes */}
        <section>
          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
            Ghi chú
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ghi chú thêm về đơn nhập này..."
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface resize-none"
          />
        </section>
      </div>

      {/* Fixed bottom: Summary + error */}
      <div className="px-8 py-4 border-t border-outline-variant/10 bg-surface-container-lowest flex-shrink-0 space-y-3">
        <div className="flex items-center justify-between bg-primary/5 px-4 py-3 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-base">payments</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
                Tổng cộng thanh toán
              </p>
              <p className="text-xs text-on-surface-variant">
                {rows.length} sản phẩm ·{" "}
                <span className="font-semibold">{subtotal.toLocaleString("vi-VN")}đ</span>
              </p>
            </div>
          </div>
          <p className="text-xl font-black text-primary font-headline">
            {total.toLocaleString("vi-VN")}{" "}
            <span className="text-sm font-medium text-primary/70">đ</span>
          </p>
        </div>

        {error && (
          <p className="text-sm text-error flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-lowest">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Hủy bỏ
        </Button>
        <Button icon="check_circle" onClick={handleSubmit} disabled={saving}>
          {saving ? "Đang lưu..." : "Xác nhận nhập kho"}
        </Button>
      </div>
    </Modal>
  );
}
