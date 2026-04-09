import { useState } from "react";
import { ImportDetailModal } from "@/components/inventory/ImportDetailModal";

type ImportStatus = "received" | "pending" | "shipping";

interface ImportRow {
  id: string;
  date: string;
  supplier: string;
  qty: number;
  total: string;
  status: ImportStatus;
}

const mockImports: ImportRow[] = [
  {
    id: "#IM-2023-001",
    date: "24/10/2023",
    supplier: "Pharma Group VN",
    qty: 1200,
    total: "45.000.000 đ",
    status: "received",
  },
  {
    id: "#IM-2023-002",
    date: "23/10/2023",
    supplier: "Medical Tech Inc",
    qty: 450,
    total: "12.300.000 đ",
    status: "pending",
  },
  {
    id: "#IM-2023-003",
    date: "22/10/2023",
    supplier: "Dược phẩm TW1",
    qty: 2800,
    total: "89.500.000 đ",
    status: "received",
  },
];

const statusConfig: Record<ImportStatus, { label: string; className: string }> =
  {
    received: { label: "Đã nhập", className: "bg-green-100 text-green-700" },
    pending: {
      label: "Chờ kiểm định",
      className: "bg-amber-100 text-amber-700",
    },
    shipping: {
      label: "Đang vận chuyển",
      className: "bg-primary/10 text-primary",
    },
  };

/** Import list table with filters for Imports page. */
export function ImportList() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.04)] overflow-hidden flex flex-col">
        {/* Filter header */}
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            Danh sách đợt nhập hàng gần đây
          </h3>
          <div className="flex gap-3">
            <div className="relative">
              <select className="pl-4 pr-10 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-xs font-semibold appearance-none focus:ring-2 focus:ring-primary/20 outline-none text-on-surface">
                <option>Tất cả nhà cung cấp</option>
                <option>Pharma Group VN</option>
                <option>Medical Tech Inc</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">
                expand_more
              </span>
            </div>
            <input
              type="date"
              className="pl-4 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
            />
            <button className="p-2 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">
                filter_list
              </span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/40">
                {[
                  "Mã đơn nhập",
                  "Ngày nhập",
                  "Nhà cung cấp",
                  "Số lượng",
                  "Tổng giá trị",
                  "Trạng thái",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={[
                      "px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant",
                      i === 3 || i === 4 ? "text-right" : "",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {mockImports.map((row) => {
                const { label, className } = statusConfig[row.status];
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-container-low/40 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-bold text-primary">
                        {row.id}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {row.date}
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-on-surface">
                      {row.supplier}
                    </td>
                    <td className="px-6 py-5 text-sm text-right font-medium text-on-surface-variant">
                      {row.qty.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-sm text-right font-bold text-on-surface">
                      {row.total}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={[
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                          className,
                        ].join(" ")}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => setSelectedId(row.id)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          visibility
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ImportDetailModal
        open={!!selectedId}
        importId={selectedId ?? ""}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
