import { Select, Button } from "@/components/common";

export interface SettlementLocationOption {
  id: string;
  label: string;
}

interface SettlementFilterBarProps {
  locations: SettlementLocationOption[];
  branchId: string;
  loading: boolean;
  onBranchChange: (v: string) => void;
  onLoad: () => void;
}

export function SettlementFilterBar({
  locations,
  branchId,
  loading,
  onBranchChange,
  onLoad,
}: SettlementFilterBarProps) {
  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm px-8 py-6 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px]">
        <Select
          label="Cơ sở"
          leadingIcon="warehouse"
          value={branchId}
          onChange={(e) => onBranchChange(e.target.value)}
        >
          <option value="">Chọn cơ sở...</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.label}
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
