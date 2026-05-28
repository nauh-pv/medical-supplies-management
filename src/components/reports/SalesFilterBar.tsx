import { Input, Select } from "@/components/common";

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
  selectedStartDate: string;
  onStartDateChange: (v: string) => void;
  selectedEndDate: string;
  onEndDateChange: (v: string) => void;
  startDateError?: string;
  endDateError?: string;
  maxStartDate?: string;
  maxEndDate?: string;
  minEndDate?: string;
}

export function SalesFilterBar({
  search,
  onSearchChange,
  branches,
  selectedBranch,
  onBranchChange,
  selectedStartDate,
  onStartDateChange,
  selectedEndDate,
  onEndDateChange,
  startDateError,
  endDateError,
  maxStartDate,
  maxEndDate,
  minEndDate,
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
          label="Cơ sở"
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          leadingIcon="warehouse"
        >
          <option value="">Tất cả cơ sở</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="w-44">
          <Input
            label="Từ ngày"
            type="date"
            value={selectedStartDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            max={maxStartDate}
            error={startDateError}
          />
        </div>
        <div className="w-44">
          <Input
            label="Đến ngày"
            type="date"
            value={selectedEndDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={minEndDate}
            max={maxEndDate}
            error={endDateError}
          />
        </div>
      </div>
    </section>
  );
}
