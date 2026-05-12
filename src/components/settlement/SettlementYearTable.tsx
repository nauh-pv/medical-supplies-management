import { Badge, Button } from "@/components/common";
import type { SettlementDoc } from "@/types/firestore";
import type { SettlementStatusFilter } from "./SettlementFilterBar";
import { MONTH_LABELS } from "@/utils/dateConfig";

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

const TABLE_HEADERS = [
  "Tháng",
  "Trạng thái",
  "Doanh thu",
  "Lợi nhuận",
  "Thao tác",
];

interface SettlementYearTableProps {
  settlements: SettlementDoc[];
  year: string;
  statusFilter: SettlementStatusFilter;
  onSettle: (month: string) => void;
  onViewDetail: (settlement: SettlementDoc) => void;
}

export function SettlementYearTable({
  settlements,
  year,
  statusFilter,
  onSettle,
  onViewDetail,
}: SettlementYearTableProps) {
  const rows = Array.from({ length: 12 }, (_, i) => {
    const mm = String(i + 1).padStart(2, "0");
    const monthStr = `${year}-${mm}`;
    const settlement = settlements.find((s) => s.month === monthStr) ?? null;
    return { monthStr, label: MONTH_LABELS[i], settlement };
  }).filter((row) => {
    if (statusFilter === "settled") return !!row.settlement;
    if (statusFilter === "unsettled") return !row.settlement;
    return true;
  });

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
      <div className="px-8 py-5 bg-surface-container-low/50">
        <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
          Lịch sử quyết toán năm {year}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              {TABLE_HEADERS.map((h, idx) => (
                <th
                  key={h}
                  className={[
                    "px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest",
                    idx >= 2 ? "text-right" : "",
                  ].join(" ")}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-on-surface-variant"
                >
                  Không có dữ liệu phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              rows.map(({ monthStr, label, settlement }) => (
                <tr
                  key={monthStr}
                  className="hover:bg-surface-container-low/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                    {label}
                  </td>
                  <td className="px-6 py-4">
                    {settlement ? (
                      <Badge variant="success" dot>
                        Đã quyết toán
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Chưa quyết toán</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-on-surface">
                    {settlement ? fmt(settlement.totalRevenue) : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-primary">
                    {settlement ? fmt(settlement.totalProfit) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {settlement ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="visibility"
                        onClick={() => onViewDetail(settlement)}
                      >
                        Xem chi tiết
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        icon="task_alt"
                        onClick={() => onSettle(monthStr)}
                        disabled={monthStr >= currentMonth}
                      >
                        Quyết toán
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
