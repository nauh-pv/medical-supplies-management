import { Badge, Button } from "@/components/common";
import type { SettlementDoc } from "@/types/firestore";

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateRange(startDate: string, endDate: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const s = new Date(startDate).toLocaleDateString("vi-VN", opts);
  const e = new Date(endDate).toLocaleDateString("vi-VN", opts);
  return `${s} → ${e}`;
}

function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

interface UnsettledInfo {
  startDate: string; // day after last settlement endDate, or beginning
  endDate: string; // today
  days: number;
  loading: boolean;
  totalRevenue: number;
  totalProfit: number;
}

interface SettlementOverviewProps {
  settlements: SettlementDoc[];
  unsettled: UnsettledInfo;
  onCreateNew: () => void;
  onViewDetail: (settlement: SettlementDoc) => void;
}

export function SettlementOverview({
  settlements,
  unsettled,
  onCreateNew,
  onViewDetail,
}: SettlementOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Unsettled period card */}
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-surface-container-low/50 flex items-center justify-between">
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
            Chưa quyết toán
          </p>
          <Badge variant="warning" dot>
            {unsettled.days} ngày
          </Badge>
        </div>

        <div className="px-8 py-6">
          {unsettled.loading ? (
            <div className="flex items-center gap-3 text-on-surface-variant py-4">
              <span className="material-symbols-outlined animate-spin text-primary text-xl">
                progress_activity
              </span>
              <span className="text-sm">Đang tính toán...</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-8">
              <div>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
                  Khoảng thời gian
                </p>
                <p className="text-sm font-semibold text-on-surface mt-1">
                  {formatDateRange(unsettled.startDate, unsettled.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
                  Doanh thu chưa quyết toán
                </p>
                <p className="text-lg font-headline font-bold text-on-surface mt-1">
                  {fmt(unsettled.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
                  Lợi nhuận chưa quyết toán
                </p>
                <p className="text-lg font-headline font-bold text-primary mt-1">
                  {fmt(unsettled.totalProfit)}
                </p>
              </div>
              <div className="ml-auto">
                <Button icon="task_alt" onClick={onCreateNew}>
                  Tạo quyết toán mới
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History table */}
      {settlements.length > 0 && (
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
          <div className="px-8 py-5 bg-surface-container-low/50 flex items-center justify-between">
            <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
              Lịch sử quyết toán
            </p>
            <Badge variant="neutral">{settlements.length} kỳ</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Kỳ quyết toán
                  </th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                    Doanh thu
                  </th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                    Lợi nhuận
                  </th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Người quyết toán
                  </th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {settlements.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-surface-bright transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-on-surface text-sm">
                        {formatDateRange(s.startDate, s.endDate)}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {daysBetween(s.startDate, s.endDate)} ngày
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface text-right">
                      {fmt(s.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary text-right">
                      {fmt(s.totalProfit)}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {s.createdByName}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="visibility"
                        onClick={() => onViewDetail(s)}
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
