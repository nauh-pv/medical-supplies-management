import { useState } from "react";
import { Input, Badge, Button, Pagination } from "@/components/common";
import type { Medicine, StockStatus } from "@/types/medicine";
import { BatchHistoryModal } from "./BatchHistoryModal";

// ── Mock data ────────────────────────────────────────────────────────────────

const medicines: Medicine[] = [
  {
    id: "AMOX-500",
    name: "Amoxicillin 500mg",
    description: "Kháng sinh phổ rộng",
    icon: "medication",
    iconBg: "bg-primary-fixed",
    iconColor: "text-primary",
    category: "prescribed",
    unit: "Vỉ (10 viên)",
    importPrice: "45.000đ",
    sellPrice: "62.000đ",
    stock: 420,
    stockPercent: 80,
    status: "in-stock",
  },
  {
    id: "PARA-500",
    name: "Paracetamol 500mg",
    description: "Giảm đau, hạ sốt",
    icon: "pill",
    iconBg: "bg-secondary-fixed-dim",
    iconColor: "text-on-secondary-fixed-variant",
    category: "otc",
    unit: "Chai (500 viên)",
    importPrice: "120.000đ",
    sellPrice: "185.000đ",
    stock: 15,
    stockPercent: 20,
    status: "out-of-stock",
  },
  {
    id: "INF-2024",
    name: "Vắc-xin Influenza 2024",
    description: "Dung dịch tiêm",
    icon: "vaccines",
    iconBg: "bg-tertiary-fixed",
    iconColor: "text-tertiary",
    category: "prescribed",
    unit: "Ống (1ml)",
    importPrice: "250.000đ",
    sellPrice: "310.000đ",
    stock: 88,
    stockPercent: 60,
    status: "low-stock",
  },
  {
    id: "PROS-100",
    name: "Siro ho Prospan",
    description: "Thảo dược",
    icon: "medication_liquid",
    iconBg: "bg-primary-fixed",
    iconColor: "text-primary",
    category: "otc",
    unit: "Chai (100ml)",
    importPrice: "68.000đ",
    sellPrice: "85.000đ",
    stock: 156,
    stockPercent: 67,
    status: "in-stock",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusConfig: Record<
  StockStatus,
  { label: string; variant: "success" | "error" | "info" }
> = {
  "in-stock": { label: "Còn hàng", variant: "success" },
  "out-of-stock": { label: "Hết hàng", variant: "error" },
  "low-stock": { label: "Sắp hết", variant: "info" },
};

const stockBarColor: Record<StockStatus, string> = {
  "in-stock": "bg-green-500",
  "out-of-stock": "bg-error",
  "low-stock": "bg-primary",
};

// ── Component ─────────────────────────────────────────────────────────────────

const TOTAL_PAGES = 321;

interface InventoryTableProps {
  onAddClick?: () => void;
}

export function InventoryTable({ onAddClick }: InventoryTableProps) {
  const [page, setPage] = useState(1);
  const [batchMed, setBatchMed] = useState<Medicine | null>(null);

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden border border-outline-variant/10">
      {/* ── Filters bar ── */}
      <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
        <div className="flex-1 min-w-[300px]">
          <Input
            leadingIcon="search"
            placeholder="Tìm kiếm tên thuốc, loại hoặc đơn vị..."
          />
        </div>
        <div className="flex items-center gap-3">
          <Button icon="add" onClick={onAddClick}>
            Thêm thuốc mới
          </Button>
          <Button variant="ghost" icon="filter_list" size="sm">
            Tất cả danh mục
          </Button>
          <Button variant="ghost" icon="export_notes" size="sm">
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low">
              {[
                { label: "Tên thuốc", cls: "pl-8" },
                { label: "Loại" },
                { label: "Đơn vị tính", cls: "text-center" },
                { label: "Giá nhập", cls: "text-right" },
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
            {medicines.map((med) => {
              const { label, variant } = statusConfig[med.status];
              const barColor = stockBarColor[med.status];
              return (
                <tr
                  key={med.id}
                  className="group hover:bg-surface-bright transition-colors border-t border-outline-variant/10"
                >
                  {/* Name */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          med.iconBg,
                          med.iconColor,
                        ].join(" ")}
                      >
                        <span className="material-symbols-outlined">
                          {med.icon}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{med.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {med.description}
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
                    {med.unit}
                  </td>

                  {/* Import price */}
                  <td className="px-6 py-5 text-right text-sm font-mono text-on-surface-variant">
                    {med.importPrice}
                  </td>

                  {/* Sell price */}
                  <td className="px-6 py-5 text-right text-sm font-mono font-bold text-on-surface">
                    {med.sellPrice}
                  </td>

                  {/* Stock with mini bar */}
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-on-surface">
                        {med.stock}
                      </span>
                      <div className="w-12 h-1 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={["h-full rounded-full", barColor].join(
                            " ",
                          )}
                          style={{ width: `${med.stockPercent}%` }}
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
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-xl">
                          visibility
                        </span>
                      </button>
                      <button
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <span className="material-symbols-outlined text-xl">
                          edit
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ── */}
      <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
        <p className="text-sm text-on-surface-variant">
          Hiển thị{" "}
          <span className="font-bold text-on-surface">
            {(page - 1) * 4 + 1} – {Math.min(page * 4, 1284)}
          </span>{" "}
          của 1,284 sản phẩm
        </p>
        <Pagination
          currentPage={page}
          totalPages={TOTAL_PAGES}
          onPageChange={setPage}
        />
      </div>

      {batchMed && (
        <BatchHistoryModal
          open={!!batchMed}
          onClose={() => setBatchMed(null)}
          medicineName={batchMed.name}
          sku={batchMed.id}
        />
      )}
    </div>
  );
}
