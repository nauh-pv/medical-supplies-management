import { Input } from "@/components/common";

const MONTH_LABELS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

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
  selectedMonth: number; // 0-11
  onMonthChange: (m: number) => void;
}

export function SalesFilterBar({
  search,
  onSearchChange,
  branches,
  selectedBranch,
  onBranchChange,
  selectedMonth,
  onMonthChange,
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

      <div className="flex bg-surface-container-low p-1 rounded-xl gap-0.5 flex-wrap">
        {MONTH_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => onMonthChange(i)}
            className={[
              "px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all",
              selectedMonth === i
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
