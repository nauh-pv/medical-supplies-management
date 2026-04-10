import { useState } from "react";
import { Input, Button, Badge, Pagination } from "@/components/common";
import { ImportDetailModal } from "./ImportDetailModal";

type ImportStatus = "received" | "pending" | "shipping";

interface ImportRow {
  id: string;
  date: string;
  time: string;
  supplier: string;
  qty: number;
  total: string;
  status: ImportStatus;
}

const mockImports: ImportRow[] = [
  {
    id: "#IM-2023-001",
    date: "24/10/2023",
    time: "14:20 PM",
    supplier: "Pharma Group VN",
    qty: 1200,
    total: "45.000.000 đ",
    status: "received",
  },
  {
    id: "#IM-2023-002",
    date: "23/10/2023",
    time: "09:15 AM",
    supplier: "Medical Tech Inc",
    qty: 450,
    total: "12.300.000 đ",
    status: "pending",
  },
  {
    id: "#IM-2023-003",
    date: "22/10/2023",
    time: "16:45 PM",
    supplier: "Dược phẩm TW1",
    qty: 2800,
    total: "89.500.000 đ",
    status: "received",
  },
  {
    id: "#IM-2023-004",
    date: "21/10/2023",
    time: "10:00 AM",
    supplier: "BioHealth Solutions",
    qty: 150,
    total: "32.000.000 đ",
    status: "shipping",
  },
];

const statusConfig: Record<
  ImportStatus,
  { label: string; variant: "success" | "warning" | "info" }
> = {
  received: { label: "Đã nhập", variant: "success" },
  pending: { label: "Chờ kiểm định", variant: "warning" },
  shipping: { label: "Đang vận chuyển", variant: "info" },
};

export function InventoryImportTab() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden border border-outline-variant/10">
        {/* Filters */}
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
          <div className="relative flex-1 min-w-[300px]">
            <Input
              leadingIcon="search"
              placeholder="Tìm kiếm mã đơn, nhà cung cấp..."
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" icon="calendar_month" size="sm">
              Chọn ngày
            </Button>
            <Button icon="add_shopping_cart" size="sm">
              Tạo đơn nhập mới
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                {[
                  { label: "Mã đơn nhập", cls: "pl-8" },
                  { label: "Ngày nhập" },
                  { label: "Nhà cung cấp" },
                  { label: "Số lượng", cls: "text-right" },
                  { label: "Tổng giá trị", cls: "text-right" },
                  { label: "Trạng thái", cls: "text-center" },
                  { label: "Thao tác", cls: "text-center" },
                ].map((h, i) => (
                  <th
                    key={i}
                    className={[
                      "px-6 py-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest",
                      h.cls ?? "",
                    ].join(" ")}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {mockImports.map((row) => {
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-container-low/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <span className="font-mono text-xs font-bold text-primary">
                        {row.id}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-on-surface">
                        {row.date}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        {row.time}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">
                            business
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-on-surface">
                          {row.supplier}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-medium text-on-surface-variant">
                        {row.qty.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm font-bold text-on-surface">
                      {row.total}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <Badge variant={statusConfig[row.status].variant}>
                        {statusConfig[row.status].label}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-center">
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

        {/* Footer */}
        <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
          <p className="text-sm text-on-surface-variant">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              1 - {mockImports.length}
            </span>{" "}
            của 84 đợt nhập hàng
          </p>
          <Pagination
            currentPage={page}
            totalPages={21}
            onPageChange={setPage}
          />
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
