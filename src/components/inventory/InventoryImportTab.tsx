import { useState, useEffect, useCallback } from "react";
import { Input, Button, Pagination } from "@/components/common";
import { ImportDetailModal } from "./ImportDetailModal";
import { CreateImportModal } from "../imports/CreateImportModal";
import { getImportOrders } from "@/services/inventory";
import type { ImportOrderDoc } from "@/types/firestore";

const ITEMS_PER_PAGE = 10;

function formatTimestamp(ts: { seconds: number } | undefined): {
  date: string;
  time: string;
} {
  if (!ts) return { date: "—", time: "" };
  const d = new Date(ts.seconds * 1000);
  return {
    date: d.toLocaleDateString("vi-VN"),
    time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function InventoryImportTab() {
  const [orders, setOrders] = useState<ImportOrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpenCreateImportModal, setIsOpenCreateImportModal] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getImportOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = orders.filter(
    (o) =>
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden border border-outline-variant/10">
        {/* Filters */}
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
          <div className="relative flex-1 min-w-[300px]">
            <Input
              leadingIcon="search"
              placeholder="Tìm kiếm mã đơn, nhà cung cấp..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" icon="calendar_month" size="sm">
              Chọn ngày
            </Button>
            <Button
              icon="add_shopping_cart"
              onClick={() => setIsOpenCreateImportModal(true)}
            >
              Nhập hàng
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">
                progress_activity
              </span>
              <span className="text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined text-4xl">inbox</span>
              <span className="text-sm">Chưa có đơn nhập kho nào.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  {[
                    { label: "Mã đơn nhập", cls: "pl-8" },
                    { label: "Ngày nhập" },
                    { label: "Nhà cung cấp" },
                    { label: "Số lượng", cls: "text-right" },
                    { label: "Tổng giá trị", cls: "text-right" },
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
                {paged.map((order) => {
                  const totalQty = order.items.reduce(
                    (s, i) => s + i.quantity,
                    0,
                  );
                  const { date, time } = formatTimestamp(
                    order.createdAt as unknown as
                      | { seconds: number }
                      | undefined,
                  );
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-container-low/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <span className="font-mono text-xs font-bold text-primary">
                          {order.code}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-on-surface">
                          {date}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          {time}
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
                            {order.supplierName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-medium text-on-surface-variant">
                          {totalQty.toLocaleString("vi-VN")}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-sm font-bold text-on-surface">
                        {order.total.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => setSelectedId(order.id)}
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
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
            <p className="text-sm text-on-surface-variant">
              Hiển thị{" "}
              <span className="font-bold text-on-surface">
                {(page - 1) * ITEMS_PER_PAGE + 1} –{" "}
                {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              của {filtered.length} đợt nhập hàng
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ImportDetailModal
        open={!!selectedId}
        importId={selectedId ?? ""}
        onClose={() => setSelectedId(null)}
      />

      <CreateImportModal
        open={isOpenCreateImportModal}
        onClose={() => setIsOpenCreateImportModal(false)}
        onSuccess={() => {
          setIsOpenCreateImportModal(false);
          loadOrders();
        }}
      />
    </>
  );
}
