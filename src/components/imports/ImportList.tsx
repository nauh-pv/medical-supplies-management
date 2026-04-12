import { useState, useEffect } from "react";
import { Badge, Pagination } from "@/components/common";
import {
  getImportRequests,
  getDispatchOrders,
  confirmDispatchReceived,
  confirmImportRequestFulfilled,
} from "@/services/inventory";
import { useUserContext } from "@/contexts/UserContext";
import type { ImportRequestDoc, DispatchOrderDoc } from "@/types/firestore";
import { ImportRequestDetailModal } from "./ImportRequestDetailModal";
import { DispatchDetailModal } from "@/components/dispatches/DispatchDetailModal";

const ITEMS_PER_PAGE = 10;

function formatTs(ts: { seconds: number } | undefined): string {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSeconds(ts: unknown): number {
  return (ts as { seconds?: number })?.seconds ?? 0;
}

type CombinedRow =
  | { rowType: "request"; data: ImportRequestDoc; sortSecs: number }
  | { rowType: "dispatch"; data: DispatchOrderDoc; sortSecs: number };

export function ImportList() {
  const userDoc = useUserContext();
  const branchId = userDoc?.branchId ?? userDoc?.uid ?? "";

  const [requests, setRequests] = useState<ImportRequestDoc[]>([]);
  const [dispatches, setDispatches] = useState<DispatchOrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<ImportRequestDoc | null>(null);
  const [selectedDispatch, setSelectedDispatch] =
    useState<DispatchOrderDoc | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmingRequestId, setConfirmingRequestId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!branchId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([getImportRequests(branchId), getDispatchOrders(branchId)])
      .then(([reqs, disps]) => {
        if (!cancelled) {
          setRequests(reqs);
          setDispatches(disps);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("ImportList fetch error:", err);
          setError("Không thể tải dữ liệu.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  async function handleConfirmReceived(dispatchId: string) {
    if (!userDoc) return;
    setConfirmingId(dispatchId);
    try {
      await confirmDispatchReceived(dispatchId, userDoc.uid);
      setDispatches((prev) =>
        prev.map((d) =>
          d.id === dispatchId ? { ...d, status: "received" as const } : d,
        ),
      );
    } catch (e) {
      console.error("Confirm dispatch error:", e);
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleConfirmRequestFulfilled(requestId: string) {
    if (!userDoc || !branchId) return;
    setConfirmingRequestId(requestId);
    // Optimistically close the modal and update status
    setSelectedRequest(null);
    try {
      await confirmImportRequestFulfilled(requestId, branchId);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "fulfilled" as const } : r,
        ),
      );
    } catch (e) {
      console.error("Confirm request fulfilled error:", e);
    } finally {
      setConfirmingRequestId(null);
    }
  }

  const combined: CombinedRow[] = [
    ...requests.map(
      (r): CombinedRow => ({
        rowType: "request",
        data: r,
        sortSecs: getSeconds(r.createdAt),
      }),
    ),
    ...dispatches.map(
      (d): CombinedRow => ({
        rowType: "dispatch",
        data: d,
        sortSecs: getSeconds(d.createdAt),
      }),
    ),
  ].sort((a, b) => b.sortSecs - a.sortSecs);

  const totalPages = Math.max(1, Math.ceil(combined.length / ITEMS_PER_PAGE));
  const paged = combined.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const inboundCount = dispatches.filter(
    (d) => d.status === "pending" || d.status === "shipping",
  ).length;

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          {
            label: "Yêu cầu đã gửi",
            value: String(requests.length),
            icon: "package_2",
            iconColor: "text-primary",
            sub: "Tổng yêu cầu nhập",
          },
          {
            label: "Chờ duyệt",
            value: String(pendingCount),
            icon: "hourglass_empty",
            iconColor: "text-amber-500",
            sub: "Đang chờ phản hồi",
          },
          {
            label: "Hàng đang về",
            value: String(inboundCount),
            icon: "local_shipping",
            iconColor: "text-green-600",
            sub: "Cần xác nhận nhập kho",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_20px_40px_rgba(0,80,203,0.03)]"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`material-symbols-outlined text-2xl ${s.iconColor}`}
              >
                {s.icon}
              </span>
            </div>
            <p className="text-3xl font-headline font-bold text-on-surface mb-1">
              {s.value}
            </p>
            <p className="text-xs font-label text-on-surface-variant mb-1">
              {s.label}
            </p>
            <p className="text-xs font-label text-on-surface-variant">
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">
              progress_activity
            </span>
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-error">
            <span className="material-symbols-outlined text-4xl">error</span>
            <span className="text-sm">{error}</span>
          </div>
        ) : combined.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">inbox</span>
            <span className="text-sm">Chưa có dữ liệu nhập hàng.</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low/30">
                {[
                  { label: "Mã đơn", cls: "pl-8" },
                  { label: "Ngày tạo" },
                  { label: "Loại" },
                  { label: "Trạng thái" },
                  { label: "Giá trị", cls: "text-right" },
                  { label: "Hành động", cls: "text-right pr-8" },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={[
                      "px-4 py-3 text-left text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant",
                      h.cls ?? "",
                    ].join(" ")}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => {
                if (row.rowType === "request") {
                  const r = row.data;
                  const statusVariant =
                    r.status === "pending"
                      ? "warning"
                      : r.status === "approved"
                        ? "success"
                        : r.status === "rejected"
                          ? "error"
                          : "neutral";
                  const statusLabel =
                    r.status === "pending"
                      ? "Chờ duyệt"
                      : r.status === "approved"
                        ? "Đã duyệt"
                        : r.status === "rejected"
                          ? "Từ chối"
                          : "Hoàn thành";
                  return (
                    <tr
                      key={`req-${r.id}`}
                      className={`${i % 2 === 1 ? "bg-surface-container-lowest/30" : ""} hover:bg-primary/5 transition-colors`}
                    >
                      <td className="px-8 py-4 text-sm font-semibold text-primary font-mono">
                        {r.code}
                      </td>
                      <td className="px-4 py-4 text-sm text-on-surface-variant">
                        {formatTs(
                          r.createdAt as unknown as
                            | { seconds: number }
                            | undefined,
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                          Yêu cầu nhập
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold font-mono text-on-surface">
                        {r.total.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === "approved" && (
                            <button
                              onClick={() =>
                                handleConfirmRequestFulfilled(r.id)
                              }
                              disabled={confirmingRequestId === r.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              {confirmingRequestId === r.id
                                ? "Đang xử lý…"
                                : "Xác nhận nhập kho"}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // dispatch row
                const d = row.data;
                const needsConfirm =
                  d.status === "pending" || d.status === "shipping";
                const dispStatusVariant =
                  d.status === "received"
                    ? "success"
                    : d.status === "shipping"
                      ? "info"
                      : d.status === "cancelled"
                        ? "error"
                        : "warning";
                const dispStatusLabel =
                  d.status === "received"
                    ? "Đã nhận"
                    : d.status === "shipping"
                      ? "Đang vận chuyển"
                      : d.status === "cancelled"
                        ? "Đã hủy"
                        : "Chờ xác nhận";
                const totalValue = d.items.reduce((s, it) => s + it.total, 0);
                return (
                  <tr
                    key={`dis-${d.id}`}
                    className={`${i % 2 === 1 ? "bg-surface-container-lowest/30" : ""} hover:bg-primary/5 transition-colors`}
                  >
                    <td className="px-8 py-4 text-sm font-semibold text-amber-700 font-mono">
                      {d.code}
                    </td>
                    <td className="px-4 py-4 text-sm text-on-surface-variant">
                      {formatTs(
                        d.createdAt as unknown as
                          | { seconds: number }
                          | undefined,
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        Điều phối từ kho
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={dispStatusVariant}>
                        {dispStatusLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold font-mono text-on-surface">
                      {totalValue.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-4 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {needsConfirm && (
                          <button
                            onClick={() => handleConfirmReceived(d.id)}
                            disabled={confirmingId === d.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            {confirmingId === d.id
                              ? "Đang xử lý…"
                              : "Xác nhận nhập kho"}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedDispatch(d)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && combined.length > 0 && (
          <div className="px-8 py-5 border-t border-outline-variant/10 bg-surface-container-low/20 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Hiển thị{" "}
              <span className="font-bold text-on-surface">
                {(page - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(page * ITEMS_PER_PAGE, combined.length)}
              </span>{" "}
              trên {combined.length.toLocaleString("vi-VN")} bản ghi
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {selectedRequest && (
        <ImportRequestDetailModal
          open={!!selectedRequest}
          requestId={selectedRequest.id}
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onConfirmFulfilled={handleConfirmRequestFulfilled}
          confirmingId={confirmingRequestId}
        />
      )}

      {selectedDispatch && (
        <DispatchDetailModal
          open={!!selectedDispatch}
          onClose={() => setSelectedDispatch(null)}
          order={selectedDispatch}
          onConfirmReceived={handleConfirmReceived}
          confirmingId={confirmingId}
        />
      )}
    </>
  );
}
