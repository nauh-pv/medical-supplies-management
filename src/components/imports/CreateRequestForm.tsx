import { useState, useEffect } from "react";
import { DrugRequestRow } from "./DrugRequestRow";
import type { DrugRow } from "./DrugRequestRow";
import { getMedicines, createImportRequest } from "@/services/inventory";
import type { MedicineDoc } from "@/types/firestore";
import { useUserContext } from "@/contexts/UserContext";

const PRIORITY_OPTIONS = [
  {
    value: "urgent" as const,
    label: "Cao (Trong vòng 24h)",
    color: "text-tertiary",
  },
  {
    value: "normal" as const,
    label: "Trung bình (2–3 ngày)",
    color: "text-primary",
  },
  {
    value: "low" as const,
    label: "Bình thường (1 tuần)",
    color: "text-on-surface-variant",
  },
];

export function CreateRequestForm() {
  const userDoc = useUserContext();
  const [medicines, setMedicines] = useState<MedicineDoc[]>([]);
  const [rows, setRows] = useState<DrugRow[]>([]);
  const [priority, setPriority] = useState<"urgent" | "normal" | "low">(
    "normal",
  );
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMedicines().then((meds) => {
      setMedicines(meds);
      if (meds.length > 0) {
        const first = meds[0];
        setRows([
          {
            id: 1,
            name: first.name,
            category:
              first.category === "prescribed" ? "Thuốc kê đơn" : "Thuốc OTC",
            unit: first.unitName,
            qty: 1,
            unitPrice: `${first.sellPrice.toLocaleString("vi-VN")}đ`,
            icon: first.icon ?? "",
            medicineId: first.id,
            medicineSku: first.sku,
            unitId: first.unitId,
            estimatedPrice: first.sellPrice,
          },
        ]);
      }
    });
  }, []);

  const drugOptions = medicines.map((m) => ({
    name: m.name,
    category: m.category === "prescribed" ? "Thuốc kê đơn" : "Thuốc OTC",
    unit: m.unitName,
    unitPrice: `${m.sellPrice.toLocaleString("vi-VN")}đ`,
    icon: m.icon ?? "",
    medicineId: m.id,
    medicineSku: m.sku,
    unitId: m.unitId,
    estimatedPrice: m.sellPrice,
  }));

  function addRow() {
    if (medicines.length === 0) return;
    const med = medicines[rows.length % medicines.length];
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: med.name,
        category: med.category === "prescribed" ? "Thuốc kê đơn" : "Thuốc OTC",
        unit: med.unitName,
        qty: 1,
        unitPrice: `${med.sellPrice.toLocaleString("vi-VN")}đ`,
        icon: med.icon ?? "",
        medicineId: med.id,
        medicineSku: med.sku,
        unitId: med.unitId,
        estimatedPrice: med.sellPrice,
      },
    ]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function changeQty(id: number, val: number) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, qty: Math.max(1, val) } : r)),
    );
  }

  function selectMedicine(rowId: number, medicineName: string) {
    const med = medicines.find((m) => m.name === medicineName);
    if (!med) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              name: med.name,
              category:
                med.category === "prescribed" ? "Thuốc kê đơn" : "Thuốc OTC",
              unit: med.unitName,
              unitPrice: `${med.sellPrice.toLocaleString("vi-VN")}đ`,
              icon: med.icon ?? "",
              medicineId: med.id,
              medicineSku: med.sku,
              unitId: med.unitId,
              estimatedPrice: med.sellPrice,
            }
          : r,
      ),
    );
  }

  async function handleSubmit() {
    if (!userDoc) {
      setError("Chưa đăng nhập.");
      return;
    }
    if (rows.length === 0) {
      setError("Vui lòng thêm ít nhất một loại thuốc.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await createImportRequest({
        branchId: userDoc.branchId ?? "WAREHOUSE",
        branchName: userDoc.branchName ?? "Kho Tổng",
        createdBy: userDoc.uid,
        createdByName: userDoc.displayName,
        priority,
        items: rows.map((r) => ({
          medicineId: r.medicineId ?? r.name,
          medicineName: r.name,
          medicineSku: r.medicineSku ?? "",
          quantity: r.qty,
          unitId: r.unitId ?? "",
          unitName: r.unit,
          estimatedPrice: r.estimatedPrice ?? 0,
          notes: "",
        })),
        notes,
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setRows([]);
      setNotes("");
    } catch {
      setError("Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  }

  const totalTypes = rows.length;
  const totalValue = rows.reduce(
    (s, r) => s + (r.estimatedPrice ?? 0) * r.qty,
    0,
  );

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="bg-primary rounded-full p-8 text-on-primary shadow-[0_20px_40px_rgba(0,80,203,0.25)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex-1 relative z-10">
          {sent ? (
            <h3 className="text-xl font-headline font-bold mb-2">
              ✅ Đã gửi yêu cầu thành công!
            </h3>
          ) : (
            <h3 className="text-xl font-headline font-bold mb-2">
              Gửi yêu cầu ngay
            </h3>
          )}
          <p className="text-sm leading-relaxed opacity-90 max-w-2xl">
            Vui lòng kiểm tra kỹ danh sách thuốc và số lượng trước khi xác nhận
            gửi về Kho tổng. Lệnh yêu cầu sau khi gửi sẽ không thể chỉnh sửa.
          </p>
          {error && (
            <p className="text-sm text-error-container font-semibold mt-2">
              {error}
            </p>
          )}
        </div>
        <div className="shrink-0 relative z-10">
          <button
            onClick={handleSubmit}
            disabled={sending || rows.length === 0}
            className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-container-low transition-all flex items-center gap-2 whitespace-nowrap shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">
              {sending ? "progress_activity" : "send"}
            </span>
            {sending ? "Đang gửi..." : "Gửi yêu cầu nhập hàng"}
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
          {/* Priority select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Mức độ ưu tiên
            </label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-xl">
                expand_more
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Ghi chú
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm (tuỳ chọn)..."
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
            />
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
              drugs={drugOptions}
              onQtyChange={changeQty}
              onRemove={removeRow}
              onSelectMedicine={selectMedicine}
            />
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-on-surface-variant text-center py-8">
              Chưa có thuốc nào. Nhấn "Thêm thuốc" để thêm.
            </p>
          )}
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
              {totalValue.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
