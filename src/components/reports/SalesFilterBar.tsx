import { Input, Select } from "@/components/common";
import { YEAR_OPTIONS, MONTH_LABELS } from "@/utils/dateConfig";

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
  selectedYear: number;
  onYearChange: (y: number) => void;
  selectedMonth: number; // 0-11
  onMonthChange: (m: number) => void;
}

export function SalesFilterBar({
  search,
  onSearchChange,
  branches,
  selectedBranch,
  onBranchChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
}: SalesFilterBarProps) {
  return (
    <section className="p-1.5 bg-surface-container-lowest rounded-2xl flex flex-wrap items-center gap-2 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
      <div className="flex-1 min-w-0 sm:min-w-[300px] w-full sm:w-auto">
        <Input
          placeholder="Tìm mã hóa đơn, chi nhánh hoặc tổng tiền..."
          leadingIcon="receipt"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="w-52">
        <Select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
        >
          <option value="">Tất cả chi nhánh</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="w-fit">
          <Select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </Select>
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
      </div>
    </section>
  );
}
