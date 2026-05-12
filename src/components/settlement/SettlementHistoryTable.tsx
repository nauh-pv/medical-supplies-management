import { Badge } from "@/components/common";
import type { SettlementDoc } from "@/types/firestore";

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function toDateStr(ts: unknown): string {
  const secs = (ts as { seconds?: number })?.seconds;
  if (!secs) return "—";
  return new Date(secs * 1000).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `Tháng ${m}/${year}`;
}

interface SettlementHistoryTableProps {
  settlements: SettlementDoc[];
  loading: boolean;
}

export function SettlementHistoryTable({
  settlements,
  loading,
}: SettlementHistoryTableProps) {
  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
      <div className="px-8 py-5 bg-surface-container-low/50 flex items-center justify-between">
        <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
          Lịch sử quyết toán
        </p>
        <Badge variant="neutral">{settlements.length} kỳ đã quyết toán</Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-primary text-2xl">
            progress_activity
          </span>
          <span className="text-sm">Đang tải...</span>
        </div>
      ) : settlements.length === 0 ? (
        <div className="px-8 py-12 text-center text-sm text-on-surface-variant">
          Chưa có kỳ quyết toán nào cho chi nhánh này.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Kỳ quyết toán
                </th>
                <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                  Hàng đã cấp
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
                  Ngày quyết toán
                </th>
                <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Trạng thái
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
                    <p className="font-bold text-on-surface">
                      {formatMonth(s.month)}
                    </p>
                    {s.notes && (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {s.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface text-right">
                    {fmt(s.totalDispatched)}
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
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {toDateStr(s.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success" dot>
                      Đã quyết toán
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
