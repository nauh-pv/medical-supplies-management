import { useState } from "react";
import { Badge, Button, Pagination, Input } from "@/components/common";
import { DispatchDetailModal } from "./DispatchDetailModal";

type DispatchStatus = "shipping" | "done" | "pending";

interface DispatchOrder {
  id: string;
  branch: string;
  branchCity: string;
  date: string;
  creator: string;
  creatorInitials: string;
  creatorColor: string;
  totalQty: number;
  status: DispatchStatus;
}

const mockOrders: DispatchOrder[] = [
  {
    id: "#ORD-2024-001",
    branch: "Bệnh viện Đa khoa Tâm Anh",
    branchCity: "TP. Hồ Chí Minh",
    date: "14/03/2024",
    creator: "Nguyễn Văn A",
    creatorInitials: "NV",
    creatorColor: "bg-primary/10 text-primary",
    totalQty: 1250,
    status: "shipping",
  },
  {
    id: "#ORD-2024-002",
    branch: "Pharmacity - Quận 1",
    branchCity: "Quận 1, TP.HCM",
    date: "12/03/2024",
    creator: "Trần Thị H",
    creatorInitials: "TH",
    creatorColor: "bg-secondary-container text-on-secondary-container",
    totalQty: 840,
    status: "done",
  },
  {
    id: "#ORD-2024-003",
    branch: "Bệnh viện Chợ Rẫy - Kho Dược A",
    branchCity: "Quận 5, TP.HCM",
    date: "11/03/2024",
    creator: "Nguyễn Văn A",
    creatorInitials: "NV",
    creatorColor: "bg-primary/10 text-primary",
    totalQty: 2100,
    status: "done",
  },
];

const statusConfig: Record<
  DispatchStatus,
  { label: string; variant: "info" | "success" | "warning" }
> = {
  shipping: { label: "Đang vận chuyển", variant: "info" },
  done: { label: "Hoàn thành", variant: "success" },
  pending: { label: "Chờ xác nhận", variant: "warning" },
};

export function DispatchList() {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
        {/* Toolbar */}
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
          <div className="flex-1 min-w-[260px] max-w-sm">
            <Input
              leadingIcon="search"
              placeholder="Tìm theo mã vận đơn hoặc chi nhánh..."
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" icon="filter_list" size="sm">
              Lọc
            </Button>
            <Button variant="ghost" icon="download" size="sm">
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  "Mã vận đơn",
                  "Chi nhánh nhận",
                  "Ngày xuất",
                  "Người tạo",
                  "Tổng số lượng",
                  "Trạng thái",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={[
                      "px-6 py-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest",
                      i === 4 ? "text-center" : "",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => {
                const { label, variant } = statusConfig[order.status];
                return (
                  <tr
                    key={order.id}
                    className="group hover:bg-surface-bright transition-colors border-t border-outline-variant/10"
                  >
                    <td className="px-6 py-5 font-bold text-primary text-sm tracking-tight">
                      {order.id}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-on-surface">
                        {order.branch}
                      </p>
                      <p className="text-[10px] text-on-surface-variant uppercase">
                        {order.branchCity}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">
                      {order.date}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={[
                            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                            order.creatorColor,
                          ].join(" ")}
                        >
                          {order.creatorInitials}
                        </div>
                        <span className="text-sm text-on-surface-variant">
                          {order.creator}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-sm text-on-surface">
                      {order.totalQty.toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={variant} dot>
                        {label}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setDetailId(order.id)}
                        className="text-sm font-bold text-primary hover:underline transition-all opacity-0 group-hover:opacity-100"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-8 py-6 border-t border-outline-variant/10 bg-surface-container-low/20 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {(page - 1) * 3 + 1}–{Math.min(page * 3, 24)}
            </span>{" "}
            của 24 lệnh xuất kho
          </p>
          <Pagination
            currentPage={page}
            totalPages={8}
            onPageChange={setPage}
          />
        </div>
      </div>

      {detailId && (
        <DispatchDetailModal
          open={!!detailId}
          onClose={() => setDetailId(null)}
          orderId={detailId}
        />
      )}
    </>
  );
}
