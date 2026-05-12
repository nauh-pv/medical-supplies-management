import { Select, Button } from "@/components/common";
import type { UserDoc } from "@/types/firestore";
import { YEAR_OPTIONS } from "@/utils/dateConfig";

export type SettlementStatusFilter = "all" | "settled" | "unsettled";

interface SettlementFilterBarProps {
  branches: UserDoc[];
  branchId: string;
  year: string;
  statusFilter: SettlementStatusFilter;
  loading: boolean;
  onBranchChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onStatusChange: (v: SettlementStatusFilter) => void;
  onLoad: () => void;
}

export function SettlementFilterBar({
  branches,
  branchId,
  year,
  statusFilter,
  loading,
  onBranchChange,
  onYearChange,
  onStatusChange,
  onLoad,
}: SettlementFilterBarProps) {
  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm px-8 py-6 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px]">
        <Select
          label="Chi nhánh"
          leadingIcon="account_tree"
          value={branchId}
          onChange={(e) => onBranchChange(e.target.value)}
        >
          <option value="">Chọn chi nhánh...</option>
          {branches.map((b) => (
            <option key={b.uid} value={b.branchId ?? b.uid}>
              {b.branchName ?? b.displayName}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-36">
        <Select
          label="Năm"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-52">
        <Select
          label="Trạng thái"
          leadingIcon="filter_list"
          value={statusFilter}
          onChange={(e) =>
            onStatusChange(e.target.value as SettlementStatusFilter)
          }
        >
          <option value="all">Tất cả</option>
          <option value="settled">Đã quyết toán</option>
          <option value="unsettled">Chưa quyết toán</option>
        </Select>
      </div>

      <Button icon="search" onClick={onLoad} disabled={!branchId || loading}>
        {loading ? "Đang tải..." : "Tải dữ liệu"}
      </Button>
    </div>
  );
}
