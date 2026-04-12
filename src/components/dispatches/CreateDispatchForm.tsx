import { useState, useEffect } from "react";
import { DispatchProductRow } from "./DispatchProductRow";
import type { ProductRow } from "./DispatchProductRow";
import {
  getBranches,
  getActiveBatches,
  createDispatchOrder,
} from "@/services/inventory";
import { useUserContext } from "@/contexts/UserContext";
import type { UserDoc, BatchDoc } from "@/types/firestore";

// Extended row carries metadata needed for submission
interface DispatchRow extends ProductRow {
  batchId: string;
  medicineId: string;
  unitId: string;
  unitPrice: number;
}

export function CreateDispatchForm({ onCancel }: { onCancel: () => void }) {
  const userDoc = useUserContext();

  const [branches, setBranches] = useState<UserDoc[]>([]);
  const [batches, setBatches] = useState<BatchDoc[]>([]);
  const [rows, setRows] = useState<DispatchRow[]>([]);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .finally(() => setLoadingBranches(false));
    getActiveBatches("WAREHOUSE")
      .then(setBatches)
      .finally(() => setLoadingBatches(false));
  }, []);

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

  function addSelectedBatch() {
    if (!selectedBatchId) return;
    const batch = batches.find((b) => b.id === selectedBatchId);
    if (!batch) return;
    // Prevent duplicate
    if (rows.some((r) => r.batchId === batch.id)) {
      setSelectedBatchId("");
      return;
    }
    const newRow: DispatchRow = {
      id: Date.now(),
      batchId: batch.id,
      medicineId: batch.medicineId,
      name: batch.medicineName,
      sku: batch.medicineSku,
      lot: batch.lot,
      stock: batch.quantity,
      unit: "", // unitName is not on batch — will be blank
      qty: 1,
      unitId: "",
      unitPrice: batch.importPrice,
    };
    setRows((prev) => [...prev, newRow]);
    setSelectedBatchId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedBranchId) {
      setErrorMsg("Vui lòng chọn chi nhánh nhận hàng.");
      return;
    }
    if (rows.length === 0) {
      setErrorMsg("Vui lòng thêm ít nháº¥t má»™t sáº£n pháº©m.");
      return;
    }
    for (const r of rows) {
      if (r.qty > r.stock) {
        setErrorMsg(`"${r.name}" xuất vượt quá tồn kho (tồn: ${r.stock}).`);
        return;
      }
    }

    const branch = branches.find((b) => b.uid === selectedBranchId);
    if (!branch || !userDoc) return;

    setSubmitting(true);
    try {
      await createDispatchOrder({
        fromLocationId: "WAREHOUSE",
        fromLocationType: "warehouse",
        toLocationId: branch.uid,
        toLocationType: "branch",
        toLocationName: branch.branchName ?? branch.displayName,
        createdBy: userDoc.uid,
        createdByName: userDoc.displayName,
        notes,
        items: rows.map((r) => ({
          medicineId: r.medicineId,
          medicineName: r.name,
          medicineSku: r.sku,
          lot: r.lot,
          batchId: r.batchId,
          quantity: r.qty,
          unitId: r.unitId,
          unitName: r.unit,
          unitPrice: r.unitPrice,
        })),
      });
      onCancel(); // switch back to history tab on success
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Tạo lệnh xuất thất bại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const totalTypes = rows.length;
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* â”€â”€ Left: Form â”€â”€ */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <section className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b border-surface-container pb-4">
            <h3 className="text-xl font-headline font-bold text-on-surface">
              Thông tin lệnh xuất
            </h3>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">info</span>
              <span className="text-xs font-label font-bold uppercase tracking-widest">
                Mã sá»‘ tá»± Ä‘á»™ng
              </span>
            </div>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Branch select */}
            <div className="space-y-3">
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant block ml-1">
                Chi nhánh nháº­n thuá»‘c
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors pointer-events-none">
                  local_hospital
                </span>
                <select
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high/40 border-none rounded-full focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[0_4px_20px_rgba(0,80,203,0.08)] transition-all appearance-none cursor-pointer text-on-surface font-medium text-sm outline-none disabled:opacity-60"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  disabled={loadingBranches}
                >
                  <option value="">
                    {loadingBranches
                      ? "Đang tải..."
                      : "Chá»n chi nhánh bá»‡nh viá»‡n / nhà thuá»‘c..."}
                  </option>
                  {branches.map((b) => (
                    <option key={b.uid} value={b.uid}>
                      {b.branchName ?? b.displayName}
                    </option>
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
                Danh má»¥c thuá»‘c &amp; Vật tư
              </label>

              {/* Medicine dropdown + Add button */}
              <div className="flex gap-3">
                <div className="relative group flex-1">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 group-focus-within:text-primary transition-colors pointer-events-none">
                    inventory
                  </span>
                  <select
                    className="w-full pl-12 pr-10 py-4 bg-surface-container-high/40 border-none rounded-full focus:ring-0 focus:bg-surface-container-lowest focus:shadow-[0_4px_20px_rgba(0,80,203,0.08)] transition-all appearance-none cursor-pointer text-on-surface font-medium text-sm outline-none disabled:opacity-60"
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    disabled={loadingBatches}
                  >
                    <option value="">
                      {loadingBatches
                        ? "Đang tải..."
                        : "Chá»n thuá»‘c tá»« danh má»¥c tá»“n kho..."}
                    </option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.medicineName} — Lô {b.lot} (Tồn:{" "}
                        {b.quantity.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addSelectedBatch}
                  disabled={!selectedBatchId}
                  className="px-6 py-4 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-40 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                  Thêm
                </button>
              </div>

              {/* Rows table */}
              {rows.length > 0 && (
                <div className="mt-6 space-y-2 overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-12 px-6 py-2 bg-surface-container-low rounded-t-xl text-[10px] font-label font-black uppercase tracking-widest text-on-surface-variant">
                    <div className="col-span-6">Tên sản phẩm / SKU</div>
                    <div className="col-span-2 text-center">Tồn kho</div>
                    <div className="col-span-3 text-center">
                      Sá»‘ lưá»£ng xuáº¥t
                    </div>
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
                          prev.map((r) =>
                            r.id === id ? { ...r, qty: val } : r,
                          ),
                        )
                      }
                      onRemove={removeRow}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant block ml-1">
                Ghi chú
              </label>
              <textarea
                className="w-full px-5 py-4 bg-surface-container-high/40 border-none rounded-3xl resize-none focus:ring-0 focus:bg-surface-container-lowest text-on-surface text-sm outline-none placeholder:text-on-surface-variant/50"
                rows={3}
                placeholder="Ghi chú yêu cầu vận chuyển, bảo quản..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-sm text-error font-semibold">{errorMsg}</p>
            )}

            {/* Footer */}
            <div className="pt-8 border-t border-surface-container flex items-center justify-between">
              <p className="text-sm text-on-surface-variant italic">
                * Lá»‡nh xuáº¥t kho sáº½ Ä‘ưá»£c gá»­i Ä‘áº¿n bá»™ pháº­n kiá»ƒm
                kê Ä‘á»ƒ xác nháº­n.
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
                  disabled={submitting}
                  className="px-10 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:scale-100"
                >
                  {submitting ? "Đang táº¡o..." : "Tạo lệnh xuất kho"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>

      {/* â”€â”€ Right: Summary card â”€â”€ */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-primary rounded-[2rem] p-8 text-on-primary shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <h4 className="text-xs font-label font-bold uppercase tracking-[0.2em] opacity-80 mb-6">
            Tóm tắt lệnh xuất
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-sm opacity-90">
                Tá»•ng sá»‘ loáº¡i thuá»‘c:
              </span>
              <span className="text-xl font-bold">
                {String(totalTypes).padStart(2, "0")}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-sm opacity-90">
                Tá»•ng sá»‘ lưá»£ng (Ä‘v):
              </span>
              <span className="text-xl font-bold">
                {totalQty.toLocaleString()}
              </span>
            </div>
            {selectedBranchId && (
              <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
                <span className="text-xs opacity-70 uppercase tracking-wider">
                  Chi nhánh nhận
                </span>
                <span className="text-sm font-bold">
                  {branches.find((b) => b.uid === selectedBranchId)
                    ?.branchName ??
                    branches.find((b) => b.uid === selectedBranchId)
                      ?.displayName ??
                    "—"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
