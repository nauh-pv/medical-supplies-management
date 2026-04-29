import { useState, useEffect, useCallback } from "react";
import { Input, Button, Pagination, DataTable } from "@/components/common";
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
              size="lg"
              placeholder="Tìm kiếm mã đơn, nhà cung cấp..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            {/* <Button variant="ghost" icon="calendar_month" size="sm">
              Chọn ngày
            </Button> */}
            <Button
              size="lg"
              icon="add_shopping_cart"
              onClick={() => setIsOpenCreateImportModal(true)}
            >
              Nhập hàng
            </Button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={[
            {
              key: "code",
              header: "Mã đơn nhập",
              render: (order) => (
                <span className="font-mono text-xs font-bold text-primary">
                  {order.code}
                </span>
              ),
            },
            {
              key: "createdAt",
              header: "Ngày nhập",
              render: (order) => {
                const { date, time } = formatTimestamp(
                  order.createdAt as unknown as { seconds: number } | undefined,
                );
                return (
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {date}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {time}
                    </p>
                  </div>
                );
              },
            },
            {
              key: "supplierName",
              header: "Nhà cung cấp",
              render: (order) => (
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
              ),
            },
            {
              key: "totalQty",
              header: "Số lượng",
              headerClassName: "text-right",
              className: "text-right text-on-surface-variant",
              render: (order) =>
                order.items
                  .reduce((s, i) => s + i.quantity, 0)
                  .toLocaleString("vi-VN"),
            },
            {
              key: "total",
              header: "Tổng giá trị",
              headerClassName: "text-right",
              className: "text-right font-mono font-bold",
              render: (order) => `${order.total.toLocaleString("vi-VN")}đ`,
            },
            {
              key: "actions",
              header: "Thao tác",
              headerClassName: "text-center",
              className: "text-center",
              render: (order) => (
                <button
                  onClick={() => setSelectedId(order.id)}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              ),
            },
          ]}
          data={paged}
          keyField="id"
          loading={loading}
          loadingRows={ITEMS_PER_PAGE}
          showIndex
          indexOffset={(page - 1) * ITEMS_PER_PAGE}
          headerRowClassName="bg-surface-container-low border-b border-outline-variant/10"
          rowClassName={() =>
            "hover:bg-surface-container-low/30 transition-colors"
          }
          emptyText="Chưa có đơn nhập kho nào."
        />

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
