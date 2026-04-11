import { useState, useEffect } from "react";
import { Badge, Pagination } from "@/components/common";
import { getImportRequests } from "@/services/inventory";
import type { ImportRequestDoc, ImportRequestStatus } from "@/types/firestore";
import { ImportRequestDetailModal } from "./ImportRequestDetailModal";

const ITEMS_PER_PAGE = 10;

const statusConfig: Record<
  ImportRequestStatus,
  {
    label: string;
    variant: "info" | "warning" | "neutral" | "success" | "error";
  }
> = {
  pending: { label: "Chờ duyệt", variant: "info" },
  approved: { label: "Đã duyệt", variant: "success" },
  rejected: { label: "Từ chối", variant: "error" },
  fulfilled: { label: "Đã hoàn thành", variant: "neutral" },
};

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

export function ImportList() {
  const [requests, setRequests] = useState<ImportRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<ImportRequestStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getImportRequests()
      .then((data) => {
        if (!cancelled) {
          setRequests(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("ImportList fetch error:", err);
          setError("Không thể tải dữ liệu yêu cầu nhập.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = requests.filter(
    (r) => statusFilter === "all" || r.status === statusFilter,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Stat counts
  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    fulfilled: requests.filter((r) => r.status === "fulfilled").length,
  };

  const statCards = [
    {
      label: "Tổng lệnh",
      value: String(counts.total),
      icon: "package_2",
      iconColor: "text-primary",
      sub: "Tất cả yêu cầu nhập",
    },
    {
      label: "Chờ duyệt",
      value: String(counts.pending),
      icon: "hourglass_empty",
      iconColor: "text-secondary",
      sub: "Cần xử lý",
    },
    {
      label: "Đã duyệt",
      value: String(counts.approved),
      icon: "check_circle",
      iconColor: "text-tertiary",
      sub: "Chờ thực hiện",
    },
    {
      label: "Hoàn thành",
      value: String(counts.fulfilled),
      icon: "task_alt",
      iconColor: "text-green-600",
      sub: "Đã nhập kho",
    },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {statCards.map((s) => (
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
            <p className="text-xs font-label text-on-surface-variant mb-2">
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
        {/* Filter bar */}
        <div className="px-8 py-5 flex items-center gap-4 border-b border-outline-variant/10">
          <select
            className="h-9 rounded-xl px-3 text-sm font-label bg-surface-container-low text-on-surface-variant focus:outline-none"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ImportRequestStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="fulfilled">Hoàn thành</option>
          </select>
        </div>

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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">inbox</span>
            <span className="text-sm">Không có yêu cầu nhập nào.</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-low/30">
                {[
                  { label: "Mã yêu cầu", cls: "pl-8" },
                  { label: "Chi nhánh" },
                  { label: "Ngày tạo" },
                  { label: "Ưu tiên" },
                  { label: "Trạng thái" },
                  { label: "Tổng giá trị", cls: "text-right" },
                  { label: "Hành động", cls: "text-center" },
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
                const cfg = statusConfig[row.status];
                const priorityVariant =
                  row.priority === "urgent"
                    ? "error"
                    : row.priority === "normal"
                      ? "info"
                      : "neutral";
                const priorityLabel =
                  row.priority === "urgent"
                    ? "Khẩn cấp"
                    : row.priority === "normal"
                      ? "Bình thường"
                      : "Thấp";
                return (
                  <tr
                    key={row.id}
                    className={`group ${i % 2 === 0 ? "" : "bg-surface-container-lowest/30"} hover:bg-primary/5 transition-colors`}
                  >
                    <td className="px-8 py-4 text-sm font-label font-semibold text-primary font-mono">
                      {row.code}
                    </td>
                    <td className="px-4 py-4 text-sm font-label text-on-surface">
                      {row.branchName}
                    </td>
                    <td className="px-4 py-4 text-sm font-label text-on-surface-variant">
                      {formatTs(
                        row.createdAt as unknown as
                          | { seconds: number }
                          | undefined,
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={priorityVariant}>{priorityLabel}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold font-mono text-on-surface">
                      {row.total.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedId(row.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-label font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-8 py-5 border-t border-outline-variant/10 bg-surface-container-low/20 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Hiển thị{" "}
              <span className="font-bold text-on-surface">
                {(page - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              trên {filtered.length.toLocaleString("vi-VN")} yêu cầu
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {selectedId && (
        <ImportRequestDetailModal
          open={!!selectedId}
          requestId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
