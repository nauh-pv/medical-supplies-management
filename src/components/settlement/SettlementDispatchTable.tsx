import type { DispatchOrderDoc } from "@/types/firestore";

function toDateStr(ts: unknown): string {
  const secs = (ts as { seconds?: number })?.seconds;
  if (!secs) return "—";
  return new Date(secs * 1000).toLocaleDateString("vi-VN");
}

interface SettlementDispatchTableProps {
  dispatches: DispatchOrderDoc[];
}

export function SettlementDispatchTable({
  dispatches,
}: SettlementDispatchTableProps) {
  if (dispatches.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm px-8 py-16 text-center text-sm text-on-surface-variant">
        Không có đơn xuất kho nào được giao nhận trong tháng này.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
      <div className="px-8 py-5 bg-surface-container-low/50">
        <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
          Chi tiết đơn xuất kho đã nhận trong tháng
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Mã đơn
              </th>
              <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Ngày nhận
              </th>
              <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Số lượng mặt hàng
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {dispatches.map((d) => (
              <tr
                key={d.id}
                className="hover:bg-surface-bright transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                    {d.code}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">
                  {toDateStr(d.receivedAt ?? d.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-on-surface">
                  {d.items.length} mặt hàng · {d.totalQty} đơn vị
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
