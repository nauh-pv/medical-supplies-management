import { Input } from "@/components/common";

export type SalesPeriod = "week" | "month" | "quarter" | "year";

const PERIOD_LABELS: Record<SalesPeriod, string> = {
  week: "Tuần",
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
};

interface BranchOption {
  id: string;
  name: string;
}

interface SalesFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  branches: BranchOption[];
  selectedBranch: string;
  onBranchChange: (v: string) => void;
  period: SalesPeriod;
  onPeriodChange: (v: SalesPeriod) => void;
}

export function SalesFilterBar({
  search,
  onSearchChange,
  branches,
  selectedBranch,
  onBranchChange,
  period,
  onPeriodChange,
}: SalesFilterBarProps) {
  return (
    <section className="p-1.5 bg-surface-container-lowest rounded-2xl flex flex-wrap items-center gap-2 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
      <div className="flex-1 min-w-[300px]">
        <Input
          placeholder="Tìm mã hóa đơn, chi nhánh hoặc tổng tiền..."
          leadingIcon="receipt"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="relative">
        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="appearance-none bg-surface-container-lowest px-6 py-2.5 pr-10 rounded-xl text-sm font-semibold text-on-surface-variant focus:ring-2 focus:ring-primary/20 cursor-pointer border-none"
        >
          <option value="">Tất cả chi nhánh</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none text-lg">
          expand_more
        </span>
      </div>

      <div className="flex bg-surface-container-low p-1 rounded-xl">
        {(["week", "month", "quarter", "year"] as SalesPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={[
              "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all",
              period === p
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary",
            ].join(" ")}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
    </section>
  );
}
