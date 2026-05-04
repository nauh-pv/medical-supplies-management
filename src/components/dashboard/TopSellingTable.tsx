import { DataTable, SectionLabel } from "@/components/common";
import type { Column } from "@/components/common";
import type { TopMedicine } from "@/services/dashboard";

const RANK_COLORS = [
  "text-primary",
  "text-on-surface-variant",
  "text-on-surface-variant",
  "text-on-surface-variant",
  "text-on-surface-variant",
];

type TableRow = {
  id: string;
  rank: string;
  rankColor: string;
  name: string;
  sku: string;
  totalQty: number;
  totalRevenue: number;
};

const columns: Column<TableRow>[] = [
  {
    key: "rank",
    header: "Hạng",
    render: (row) => (
      <span className={["text-sm font-bold", row.rankColor].join(" ")}>
        {row.rank}
      </span>
    ),
  },
  {
    key: "name",
    header: "Tên thuốc",
    render: (row) => (
      <div>
        <p className="text-sm font-semibold text-on-surface">{row.name}</p>
        <p className="text-xs text-on-surface-variant">SKU: {row.sku}</p>
      </div>
    ),
  },
  {
    key: "totalQty",
    header: "Đã bán",
    className: "text-right",
    render: (row) => (
      <span className="text-sm font-bold text-on-surface">
        {row.totalQty.toLocaleString("vi-VN")}
      </span>
    ),
  },
  {
    key: "totalRevenue",
    header: "Doanh thu",
    className: "text-right",
    render: (row) => (
      <span className="text-sm font-mono font-semibold text-primary">
        {row.totalRevenue >= 1_000_000
          ? `${(row.totalRevenue / 1_000_000).toFixed(1)}M₫`
          : `${Math.round(row.totalRevenue / 1_000)}K₫`}
      </span>
    ),
  },
];

interface TopSellingTableProps {
  data: TopMedicine[];
  loading: boolean;
}

/** Top selling products table using DataTable — real POS data. */
export function TopSellingTable({ data, loading }: TopSellingTableProps) {
  const rows: TableRow[] = data.map((m, i) => ({
    id: m.medicineId,
    rank: `#${i + 1}`,
    rankColor: RANK_COLORS[i] ?? "text-on-surface-variant",
    name: m.medicineName,
    sku: m.medicineSku,
    totalQty: m.totalQty,
    totalRevenue: m.totalRevenue,
  }));

  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-4 sm:p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-headline font-bold text-xl text-on-surface">
          Top thuốc bán chạy
        </h4>
        <SectionLabel>Theo tháng</SectionLabel>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-on-surface-variant text-sm gap-2">
          <span className="material-symbols-outlined animate-spin text-primary">
            progress_activity
          </span>
          Đang tải...
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-10">
          Chưa có dữ liệu giao dịch
        </p>
      ) : (
        <DataTable columns={columns} data={rows} keyField="id" />
      )}
    </div>
  );
}
