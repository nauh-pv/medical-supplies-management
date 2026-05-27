import { Select, Button } from "@/components/common";
import type { UserDoc } from "@/types/firestore";

interface SettlementFilterBarProps {
  branches: UserDoc[];
  branchId: string;
  loading: boolean;
  onBranchChange: (v: string) => void;
  onLoad: () => void;
}

export function SettlementFilterBar({
  branches,
  branchId,
  loading,
  onBranchChange,
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

      <Button icon="search" onClick={onLoad} disabled={!branchId || loading}>
        {loading ? "Đang tải..." : "Tải dữ liệu"}
      </Button>
    </div>
  );
}
