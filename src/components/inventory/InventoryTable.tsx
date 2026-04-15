import { useState, useEffect } from "react";
import { Input, Badge, Button, Pagination, Modal } from "@/components/common";
import type {
  MedicineDoc,
  InventoryDoc,
  BatchDoc,
  UserDoc,
} from "@/types/firestore";
import {
  getMedicines,
  getInventory,
  getUnits,
  getActiveBatches,
  deleteMedicine,
  getBranches,
} from "@/services/inventory";
import { BatchHistoryModal } from "./BatchHistoryModal";
import { SetPriceModal } from "./SetPriceModal";
import { AddMedicineModal } from "./AddMedicineModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

type DisplayStatus = "in-stock" | "low-stock" | "out-of-stock";

function getDisplayStatus(qty: number, minLevel: number): DisplayStatus {
  if (qty === 0) return "out-of-stock";
  if (qty <= minLevel) return "low-stock";
  return "in-stock";
}

const statusConfig: Record<
  DisplayStatus,
  { label: string; variant: "success" | "error" | "info" }
> = {
  "in-stock": { label: "Còn hàng", variant: "success" },
  "out-of-stock": { label: "Hết hàng", variant: "error" },
  "low-stock": { label: "Sắp hết", variant: "info" },
};

const stockBarColor: Record<DisplayStatus, string> = {
  "in-stock": "bg-green-500",
  "out-of-stock": "bg-error",
  "low-stock": "bg-primary",
};

const ITEMS_PER_PAGE = 10;

// ── Component ─────────────────────────────────────────────────────────────────

interface InventoryTableProps {
  onAddClick?: () => void;
  refetchTrigger?: number;
  locationId?: string;
}

export function InventoryTable({
  onAddClick,
  refetchTrigger,
}: InventoryTableProps) {
  const [medicines, setMedicines] = useState<MedicineDoc[]>([]);
  const [inventory, setInventory] = useState<InventoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteMed, setDeleteMed] = useState<MedicineDoc | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [batchMed, setBatchMed] = useState<MedicineDoc | null>(null);
  const [priceMed, setPriceMed] = useState<MedicineDoc | null>(null);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [batches, setBatches] = useState<BatchDoc[]>([]);
  const [editMed, setEditMed] = useState<MedicineDoc | null>(null);
  const [locationId, setLocationId] = useState("WAREHOUSE");
  const [branches, setBranches] = useState<UserDoc[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      getMedicines(),
      getInventory(locationId),
      getActiveBatches(locationId),
    ])
      .then(([meds, inv, batchList]) => {
        if (!cancelled) {
          setMedicines(meds);
          setInventory(inv);
          setBatches(batchList);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("InventoryTable fetch error:", err);
          setError(
            "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và Firestore rules.",
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refetchTrigger, locationId]);

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    getBranches().then(setBranches);
  }, []);

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.unitName.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function getStock(medicineId: string) {
    // Prefer the deterministic <location>_<medicineId> doc;
    // fall back to any matching record for backward compat with older data.
    const preferred = inventory.find(
      (i) => i.id === `${locationId}_${medicineId}`,
    );
    if (preferred) return preferred.quantity;
    return inventory.find((i) => i.medicineId === medicineId)?.quantity ?? 0;
  }

  async function handleDelete() {
    if (!deleteMed) return;
    setDeleting(true);
    try {
      await deleteMedicine(deleteMed.id);
      setMedicines((prev) => prev.filter((m) => m.id !== deleteMed.id));
      setDeleteMed(null);
    } catch (err) {
      console.error("Delete medicine error:", err);
    } finally {
      setDeleting(false);
    }
  }

  function getAvgImportPrice(medicineId: string): number {
    const bs = batches.filter(
      (b) => b.medicineId === medicineId && b.quantity > 0,
    );
    if (bs.length === 0) return 0;
    const totalValue = bs.reduce((s, b) => s + b.importPrice * b.quantity, 0);
    const totalQty = bs.reduce((s, b) => s + b.quantity, 0);
    return totalQty > 0 ? Math.round(totalValue / totalQty) : 0;
  }

  function getMinLevel(med: MedicineDoc) {
    return (
      inventory.find((i) => i.medicineId === med.id)?.minStockLevel ??
      med.minStockLevel
    );
  }

  async function loadUnits() {
    setLoading(true);
    try {
      const data = await getUnits();
      setUnits(data);
    } catch (err) {
      console.error("UnitTable fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const convertUnitIdToName = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    return unit ? unit.name : "N/A";
  };

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden border border-outline-variant/10">
      {/* ── Filters bar ── */}
      <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
        <div className="flex-1 min-w-[300px]">
          <Input
            leadingIcon="search"
            placeholder="Tìm kiếm tên thuốc, SKU hoặc đơn vị..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none text-lg">
              warehouse
            </span>
            <select
              className="pl-10 pr-8 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-full text-sm font-medium text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="WAREHOUSE">Kho Tổng</option>
              {branches.map((b) => (
                <option key={b.uid} value={b.uid}>
                  {b.branchName ?? b.displayName}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">
              expand_more
            </span>
          </div>
          {/* <Button variant="ghost" icon="filter_list" size="md">
            Tất cả danh mục
          </Button> */}
          {/* <Button variant="ghost" icon="export_notes" size="md">
            Xuất báo cáo
          </Button> */}
          <Button icon="add" onClick={onAddClick} size="lg">
            Thêm thuốc mới
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant gap-3">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">
              progress_activity
            </span>
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-error gap-3">
            <span className="material-symbols-outlined text-4xl">error</span>
            <span className="text-sm text-center max-w-sm">{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
            <span className="material-symbols-outlined text-4xl">
              inventory_2
            </span>
            <span className="text-sm">Không tìm thấy sản phẩm nào.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  { label: "Tên thuốc", cls: "pl-8" },
                  { label: "Danh mục" },
                  { label: "Đơn vị tính", cls: "text-center" },
                  { label: "Giá nhập TB", cls: "text-right" },
                  { label: "Giá bán", cls: "text-right" },
                  { label: "Tồn kho", cls: "text-center" },
                  { label: "Trạng thái", cls: "text-center" },
                  { label: "Thao tác", cls: "text-center" },
                ].map((h, i) => (
                  <th
                    key={i}
                    className={[
                      "px-6 py-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest",
                      h.cls ?? "",
                    ].join(" ")}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paged.map((med) => {
                const stock = getStock(med.id);
                const minLevel = getMinLevel(med);
                const displayStatus = getDisplayStatus(stock, minLevel);
                const { label, variant } = statusConfig[displayStatus];
                const barColor = stockBarColor[displayStatus];
                const maxStock = Math.max(stock, med.minStockLevel * 3, 1);
                const stockPercent = Math.min(100, (stock / maxStock) * 100);

                return (
                  <tr
                    key={med.id}
                    className="group hover:bg-surface-bright transition-colors border-t border-outline-variant/10"
                  >
                    {/* Name */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {med.imageUrl ? (
                          <img
                            src={med.imageUrl}
                            alt={med.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-on-surface-variant">
                              medication
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-on-surface">
                            {med.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {med.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-5">
                      <Badge
                        variant={
                          med.category === "prescribed" ? "info" : "neutral"
                        }
                      >
                        {med.category === "prescribed"
                          ? "Kê đơn"
                          : "Không kê đơn"}
                      </Badge>
                    </td>

                    {/* Unit */}
                    <td className="px-6 py-5 text-center text-sm font-medium text-on-surface-variant">
                      {convertUnitIdToName(med.unitId)}
                    </td>

                    {/* Avg import price from active batches */}
                    <td className="px-6 py-5 text-right text-sm font-mono text-on-surface-variant">
                      {(() => {
                        const p = getAvgImportPrice(med.id);
                        return p > 0 ? p.toLocaleString("vi-VN") + "đ" : "—";
                      })()}
                    </td>

                    {/* Sell price */}
                    <td className="px-6 py-5 text-right text-sm font-mono font-bold text-on-surface">
                      {med.sellPrice.toLocaleString("vi-VN")}đ
                    </td>

                    {/* Stock with mini bar */}
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-on-surface">
                          {stock.toLocaleString("vi-VN")}
                        </span>
                        <div className="w-12 h-1 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={["h-full rounded-full", barColor].join(
                              " ",
                            )}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-5 text-center">
                      <Badge variant={variant} dot>
                        {label}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setBatchMed(med)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Lịch sử nhập kho theo lô"
                        >
                          <span className="material-symbols-outlined text-xl">
                            visibility
                          </span>
                        </button>
                        <button
                          onClick={() => setPriceMed(med)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Cập nhật giá bán"
                        >
                          <span className="material-symbols-outlined text-xl">
                            sell
                          </span>
                        </button>
                        <button
                          onClick={() => setEditMed(med)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-xl">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => setDeleteMed(med)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
                          title="Xóa thuốc"
                        >
                          <span className="material-symbols-outlined text-xl">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination footer ── */}
      {!loading && filtered.length > 0 && (
        <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
          <p className="text-sm text-on-surface-variant">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {(page - 1) * ITEMS_PER_PAGE + 1} –{" "}
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            của {filtered.length.toLocaleString("vi-VN")} kết quả
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {batchMed && (
        <BatchHistoryModal
          open={!!batchMed}
          onClose={() => setBatchMed(null)}
          medicineId={batchMed.id}
          medicineName={batchMed.name}
          unitName={batchMed.unitName}
          sku={batchMed.sku}
        />
      )}

      <SetPriceModal
        open={!!priceMed}
        medicine={priceMed}
        onClose={() => setPriceMed(null)}
        onSuccess={() => {
          setPriceMed(null);
          getMedicines().then(setMedicines);
        }}
      />

      <AddMedicineModal
        open={!!editMed}
        medicine={editMed}
        onClose={() => setEditMed(null)}
        onSuccess={() => {
          setEditMed(null);
          Promise.all([getMedicines(), getInventory(locationId)]).then(
            ([meds, inv]) => {
              setMedicines(meds);
              setInventory(inv);
            },
          );
        }}
      />

      {/* ── Delete confirmation ── */}
      <Modal
        open={!!deleteMed}
        onClose={() => setDeleteMed(null)}
        title="Xác nhận xóa thuốc"
        maxWidth="max-w-md"
      >
        <div className="px-10 py-8 space-y-6">
          <p className="text-sm text-on-surface-variant">
            Bạn có chắc chắn muốn xóa thuốc{" "}
            <span className="font-bold text-on-surface">{deleteMed?.name}</span>{" "}
            ({deleteMed?.sku}) khỏi hệ thống? Thao tác này sẽ vô hiệu hóa sản
            phẩm.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteMed(null)}
              className="flex-1 justify-center"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              icon="delete"
              onClick={handleDelete}
              className="flex-1 justify-center"
            >
              {deleting ? "Đang xóa..." : "Xóa thuốc"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
