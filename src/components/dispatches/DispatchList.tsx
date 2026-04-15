import { useState, useEffect } from "react";
import { Badge, Button, Pagination, Input, Modal } from "@/components/common";
import { DispatchDetailModal } from "./DispatchDetailModal";
import { ImportRequestDetailModal } from "@/components/imports/ImportRequestDetailModal";
import {
  getDispatchOrders,
  getImportRequests,
  approveImportRequest,
  confirmDispatchShipped,
} from "@/services/inventory";
import { useUserContext } from "@/contexts/UserContext";
import type { DispatchOrderDoc, ImportRequestDoc } from "@/types/firestore";

const PAGE_SIZE = 8;

const DISPATCH_STATUS: Record<
  string,
  { label: string; variant: "info" | "success" | "warning" | "error" }
> = {
  shipping: { label: "Đang vận chuyển", variant: "info" },
  received: { label: "Hoàn thành", variant: "success" },
  pending: { label: "Chờ xác nhận", variant: "warning" },
  cancelled: { label: "Đã hủy", variant: "error" },
};

const REQUEST_STATUS: Record<
  string,
  { label: string; variant: "warning" | "success" | "error" | "neutral" }
> = {
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "neutral" },
  rejected: { label: "Từ chối", variant: "error" },
  fulfilled: { label: "Hoàn thành", variant: "success" },
};

type CombinedRow =
  | { rowType: "dispatch"; data: DispatchOrderDoc; sortSecs: number }
  | { rowType: "request"; data: ImportRequestDoc; sortSecs: number };

function getSeconds(ts: unknown): number {
  return (ts as { seconds?: number })?.seconds ?? 0;
}

function formatDate(ts: unknown): string {
  const secs = getSeconds(ts);
  if (!secs) return "—";
  return new Date(secs * 1000).toLocaleDateString("vi-VN");
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
}

export function DispatchList() {
  const userDoc = useUserContext();
  const isManager = userDoc?.role === "warehouse_manager";

  const [dispatches, setDispatches] = useState<DispatchOrderDoc[]>([]);
  const [requests, setRequests] = useState<ImportRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDispatch, setSelectedDispatch] =
    useState<DispatchOrderDoc | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [confirmDispatch, setConfirmDispatch] =
    useState<DispatchOrderDoc | null>(null);
  const [shippingId, setShippingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDispatchOrders(), getImportRequests()])
      .then(([d, r]) => {
        setDispatches(d);
        setRequests(r);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(reqId: string) {
    if (!userDoc) return;
    setApprovingId(reqId);
    try {
      await approveImportRequest(reqId, userDoc.uid, userDoc.displayName);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === reqId ? { ...r, status: "approved" as const } : r,
        ),
      );
    } finally {
      setApprovingId(null);
    }
  }

  async function handleConfirmShipped() {
    if (!confirmDispatch) return;
    const orderId = confirmDispatch.id;
    setShippingId(orderId);
    setConfirmDispatch(null);
    try {
      await confirmDispatchShipped(orderId);
      setDispatches((prev) =>
        prev.map((d) =>
          d.id === orderId ? { ...d, status: "received" as const } : d,
        ),
      );
    } catch (e) {
      console.error("Confirm dispatch shipped error:", e);
    } finally {
      setShippingId(null);
    }
  }

  const combined: CombinedRow[] = [
    ...dispatches.map(
      (d): CombinedRow => ({
        rowType: "dispatch",
        data: d,
        sortSecs: getSeconds(d.createdAt),
      }),
    ),
    ...requests.map(
      (r): CombinedRow => ({
        rowType: "request",
        data: r,
        sortSecs: getSeconds(r.createdAt),
      }),
    ),
  ].sort((a, b) => b.sortSecs - a.sortSecs);

  const filtered = combined.filter((row) => {
    if (!search) return true;
    const s = search.toLowerCase();
    if (row.rowType === "dispatch") {
      return (
        row.data.code.toLowerCase().includes(s) ||
        row.data.toLocationName.toLowerCase().includes(s)
      );
    }
    return (
      row.data.code.toLowerCase().includes(s) ||
      row.data.branchName.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
        {/* Toolbar */}
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
          <div className="flex-1 min-w-[260px] max-w-sm">
            <Input
              leadingIcon="search"
              placeholder="Tìm theo mã vận đơn hoặc chi nhánh..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
                  "Mã đơn",
                  "Chi nhánh",
                  "Ngày tạo",
                  "Người tạo",
                  "Loại",
                  "Trạng thái",
                  "Hành động",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={[
                      "px-6 py-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest",
                      i === 6 ? "text-right" : "",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-outline-variant/10">
                    <td colSpan={7} className="px-6 py-5">
                      <div className="h-8 bg-surface-container-low rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-on-surface-variant"
                  >
                    {search
                      ? "Không tìm thấy kết quả phù hợp"
                      : "Chưa có dữ liệu"}
                  </td>
                </tr>
              ) : (
                paginated.map((row) => {
                  if (row.rowType === "dispatch") {
                    const { label, variant } =
                      DISPATCH_STATUS[row.data.status] ??
                      DISPATCH_STATUS.pending;
                    return (
                      <tr
                        key={`d-${row.data.id}`}
                        className="hover:bg-surface-bright transition-colors border-t border-outline-variant/10"
                      >
                        <td className="px-6 py-5 font-bold text-primary text-sm tracking-tight">
                          {row.data.code}
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-on-surface">
                            {row.data.toLocationName}
                          </p>
                          <p className="text-[10px] text-on-surface-variant uppercase">
                            ID: {row.data.toLocationId}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant">
                          {formatDate(row.data.createdAt)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary">
                              {initials(row.data.createdByName)}
                            </div>
                            <span className="text-sm text-on-surface-variant">
                              {row.data.createdByName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                            Xuất kho
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <Badge variant={variant} dot>
                            {label}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isManager && row.data.status === "pending" && (
                              <button
                                onClick={() => setConfirmDispatch(row.data)}
                                disabled={shippingId === row.data.id}
                                className="text-sm font-bold text-green-700 hover:underline disabled:opacity-50"
                              >
                                {shippingId === row.data.id
                                  ? "Đang xử lý…"
                                  : "Xác nhận xuất kho"}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedDispatch(row.data)}
                              className="text-sm font-bold text-primary hover:underline"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // import request row
                  const { label, variant } =
                    REQUEST_STATUS[row.data.status] ?? REQUEST_STATUS.pending;
                  return (
                    <tr
                      key={`r-${row.data.id}`}
                      className="hover:bg-surface-bright transition-colors border-t border-outline-variant/10"
                    >
                      <td className="px-6 py-5 font-bold text-amber-700 text-sm tracking-tight">
                        {row.data.code}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-on-surface">
                          {row.data.branchName}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">
                        {formatDate(row.data.createdAt)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-amber-100 text-amber-700">
                            {initials(row.data.createdByName)}
                          </div>
                          <span className="text-sm text-on-surface-variant">
                            {row.data.createdByName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                          Yêu cầu nhập
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant={variant} dot>
                          {label}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isManager && row.data.status === "pending" && (
                            <button
                              onClick={() => handleApprove(row.data.id)}
                              disabled={approvingId === row.data.id}
                              className="text-sm font-bold text-green-700 hover:underline disabled:opacity-50"
                            >
                              {approvingId === row.data.id
                                ? "Đang xử lý…"
                                : "Xác nhận"}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedRequestId(row.data.id)}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-8 py-6 border-t border-outline-variant/10 bg-surface-container-low/20 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {filtered.length === 0
                ? "0"
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}`}
            </span>{" "}
            của {filtered.length} bản ghi
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {selectedDispatch && (
        <DispatchDetailModal
          open={!!selectedDispatch}
          onClose={() => setSelectedDispatch(null)}
          order={selectedDispatch}
        />
      )}

      {selectedRequestId && (
        <ImportRequestDetailModal
          open={!!selectedRequestId}
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}

      {/* Confirm ship popup */}
      <Modal
        open={!!confirmDispatch}
        onClose={() => setConfirmDispatch(null)}
        title="Xác nhận xuất kho"
        subtitle={confirmDispatch ? `Mã lệnh: ${confirmDispatch.code}` : ""}
        maxWidth="max-w-md"
      >
        <div className="px-10 py-6 space-y-4">
          <p className="text-sm text-on-surface-variant">
            Bạn sắp xác nhận xuất kho đơn hàng này. Hành động này sẽ:
          </p>
          <ul className="text-sm text-on-surface-variant list-disc list-inside space-y-1">
            <li>
              Chuyển trạng thái đơn sang <strong>Đang vận chuyển</strong>
            </li>
            <li>Trừ số lượng tương ứng khỏi kho tổng</li>
          </ul>
          <p className="text-sm font-semibold text-on-surface">
            Chi nhánh nhận: {confirmDispatch?.toLocationName}
          </p>
          <div className="flex gap-3 pt-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmDispatch(null)}>
              Hủy bỏ
            </Button>
            <Button icon="local_shipping" onClick={handleConfirmShipped}>
              Xác nhận xuất kho
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
