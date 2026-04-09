import { DataTable, SectionLabel } from "@/components/common";
import type { Column } from "@/components/common";

type CategoryStyle = {
  label: string;
  className: string;
};

type TopProduct = {
  id: string;
  rank: string;
  rankColor: string;
  name: string;
  sku: string;
  category: CategoryStyle;
  sales: string;
  growth: string;
  growthUp: boolean;
};

const topProducts: TopProduct[] = [
  {
    id: "PARA-500",
    rank: "#1",
    rankColor: "text-primary",
    name: "Paracetamol 500mg",
    sku: "SKU: PARA-500",
    category: { label: "Giảm đau", className: "bg-primary/10 text-primary" },
    sales: "12,450",
    growth: "18%",
    growthUp: true,
  },
  {
    id: "AUG-625",
    rank: "#2",
    rankColor: "text-on-surface-variant",
    name: "Augmentin 625mg",
    sku: "SKU: AUG-625",
    category: {
      label: "Kháng sinh",
      className: "bg-purple-50 text-purple-600",
    },
    sales: "8,200",
    growth: "12%",
    growthUp: true,
  },
  {
    id: "NEX-40",
    rank: "#3",
    rankColor: "text-on-surface-variant",
    name: "Nexium 40mg",
    sku: "SKU: NEX-40",
    category: { label: "Tiêu hóa", className: "bg-orange-50 text-orange-600" },
    sales: "6,900",
    growth: "4%",
    growthUp: false,
  },
];

const columns: Column<TopProduct>[] = [
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
        <p className="text-xs text-on-surface-variant">{row.sku}</p>
      </div>
    ),
  },
  {
    key: "category",
    header: "Phân loại",
    render: (row) => (
      <span
        className={[
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
          row.category.className,
        ].join(" ")}
      >
        {row.category.label}
      </span>
    ),
  },
  {
    key: "sales",
    header: "Doanh số",
    className: "text-right",
    render: (row) => (
      <span className="text-sm font-bold text-on-surface">{row.sales}</span>
    ),
  },
  {
    key: "growth",
    header: "Tăng trưởng",
    className: "text-right",
    render: (row) => (
      <span
        className={[
          "flex items-center justify-end gap-1 text-xs font-medium",
          row.growthUp ? "text-green-600" : "text-error",
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-xs">
          {row.growthUp ? "trending_up" : "trending_down"}
        </span>
        {row.growth}
      </span>
    ),
  },
];

/** Top selling products table using DataTable. */
export function TopSellingTable() {
  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-headline font-bold text-xl text-on-surface">
          Top thuốc bán chạy
        </h4>
        <SectionLabel>Theo tháng</SectionLabel>
      </div>

      <DataTable columns={columns} data={topProducts} keyField="id" />
    </div>
  );
}
