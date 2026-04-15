import { useState } from "react";
import { Badge, Pagination, Modal } from "@/components/common";
import type { PosTransactionDoc } from "@/types/firestore";

const PAGE_SIZE = 8;

const PAYMENT_ICONS: Record<string, { icon: string; label: string }> = {
  cash: { icon: "payments", label: "Tiền mặt" },
  card: { icon: "credit_card", label: "Thẻ" },
  transfer: { icon: "credit_card", label: "Chuyển khoản" },
};

function getSeconds(ts: unknown): number {
  return (ts as { seconds?: number })?.seconds ?? 0;
}

function formatDate(ts: unknown): string {
  const secs = getSeconds(ts);
  if (!secs) return "—";
  return new Date(secs * 1000).toLocaleDateString("vi-VN");
}

function formatTime(ts: unknown): string {
  const secs = getSeconds(ts);
  if (!secs) return "";
  return new Date(secs * 1000).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function fmt(value: number): string {
  return value.toLocaleString("vi-VN");
}

interface SalesTransactionTableProps {
  data: PosTransactionDoc[];
  loading: boolean;
}

export function SalesTransactionTable({
  data,
  loading,
}: SalesTransactionTableProps) {
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<PosTransactionDoc | null>(null);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <section className="bg-surface-container-lowest rounded-[2rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between bg-surface-container-low/50">
          <h4 className="font-headline font-bold text-lg flex items-center gap-2">
            Lịch sử giao dịch hóa đơn
          </h4>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/60">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  Mã hóa đơn
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  Ngày bán
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  Chi nhánh
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  Tổng tiền
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  PT Thanh toán
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  Trạng thái
                </th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">
                      progress_activity
                    </span>
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-on-surface-variant text-sm"
                  >
                    Không có giao dịch nào.
                  </td>
                </tr>
              ) : (
                paged.map((tx, i) => {
                  const pm = PAYMENT_ICONS[tx.paymentMethod] ?? {
                    icon: "payments",
                    label: tx.paymentMethod,
                  };
                  return (
                    <tr
                      key={tx.id}
                      className={[
                        "hover:bg-primary/[0.03] transition-colors",
                        i % 2 === 1 ? "bg-surface-container-low/30" : "",
                      ].join(" ")}
                    >
                      <td className="px-8 py-5">
                        <span className="text-sm font-extrabold text-primary font-headline">
                          {tx.code}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-on-surface">
                          {formatDate(tx.createdAt)}
                        </div>
                        <div className="text-[10px] text-on-surface-variant">
                          {formatTime(tx.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full bg-surface-container text-[10px] font-bold text-on-surface-variant uppercase">
                          {tx.branchName}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-extrabold text-on-surface font-headline">
                          {fmt(tx.total)} đ
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">
                            {pm.icon}
                          </span>
                          {pm.label}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant="success" dot>
                          Hoàn thành
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => setDetail(tx)}
                          className="p-2 text-on-surface-variant/30 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined">
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="px-8 py-5 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Hiển thị {(page - 1) * PAGE_SIZE + 1} -{" "}
              {Math.min(page * PAGE_SIZE, data.length)} trong số {data.length}{" "}
              hóa đơn
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

      {/* Detail Modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Chi tiết hóa đơn"
        subtitle={detail?.code ?? ""}
        maxWidth="max-w-2xl"
      >
        {detail && (
          <div className="px-8 py-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">
                  Chi nhánh
                </p>
                <p className="font-semibold">{detail.branchName}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">
                  Ngày bán
                </p>
                <p className="font-semibold">
                  {formatDate(detail.createdAt)} {formatTime(detail.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">
                  Nhân viên
                </p>
                <p className="font-semibold">{detail.createdByName}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">
                  Phương thức
                </p>
                <p className="font-semibold">
                  {PAYMENT_ICONS[detail.paymentMethod]?.label ??
                    detail.paymentMethod}
                </p>
              </div>
            </div>

            {/* Items table */}
            <div className="rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      SL
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 1 ? "bg-surface-container-low/30" : ""
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold">{item.medicineName}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {item.medicineSku} · Lô: {item.lot}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {fmt(item.unitPrice)}đ
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {fmt(item.total)}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tạm tính</span>
                <span className="font-semibold">{fmt(detail.subtotal)}đ</span>
              </div>
              {detail.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Giảm giá</span>
                  <span className="font-semibold text-error">
                    -{fmt(detail.discount)}đ
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-outline-variant/20">
                <span className="font-bold text-on-surface">Tổng cộng</span>
                <span className="font-extrabold text-primary text-lg">
                  {fmt(detail.total)}đ
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
