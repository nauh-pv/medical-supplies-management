import { useState } from "react";
import { useEffect } from "react";
import { Badge, Pagination, Modal, DataTable } from "@/components/common";
import type { PosTransactionDoc, PosTransactionItem } from "@/types/firestore";

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

  useEffect(() => {
    setPage(1);
  }, [data]);

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
        <DataTable<PosTransactionDoc>
          columns={[
            {
              key: "code",
              header: "Mã hóa đơn",
              render: (tx) => (
                <span className="text-sm font-extrabold text-primary font-headline">
                  {tx.code}
                </span>
              ),
            },
            {
              key: "createdAt",
              header: "Ngày bán",
              render: (tx) => (
                <div>
                  <div className="text-sm font-bold text-on-surface">
                    {formatDate(tx.createdAt)}
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    {formatTime(tx.createdAt)}
                  </div>
                </div>
              ),
            },
            {
              key: "branchName",
              header: "Chi nhánh",
              render: (tx) => (
                <span className="px-3 py-1 rounded-full bg-surface-container text-[10px] font-bold text-on-surface-variant uppercase">
                  {tx.branchName}
                </span>
              ),
            },
            {
              key: "total",
              header: "Tổng tiền",
              render: (tx) => (
                <span className="text-sm font-extrabold text-on-surface font-headline">
                  {fmt(tx.total)} đ
                </span>
              ),
            },
            {
              key: "paymentMethod",
              header: "PT Thanh toán",
              render: (tx) => {
                const pm = PAYMENT_ICONS[tx.paymentMethod] ?? {
                  icon: "payments",
                  label: tx.paymentMethod,
                };
                return (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">
                      {pm.icon}
                    </span>
                    {pm.label}
                  </div>
                );
              },
            },
            {
              key: "status",
              header: "Trạng thái",
              render: () => (
                <Badge variant="success" dot>
                  Hoàn thành
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Thao tác",
              headerClassName: "text-right",
              className: "text-right",
              render: (tx) => (
                <button
                  onClick={() => setDetail(tx)}
                  className="p-2 text-on-surface-variant/30 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              ),
            },
          ]}
          data={paged}
          keyField="id"
          loading={loading}
          loadingRows={PAGE_SIZE}
          showIndex
          indexOffset={(page - 1) * PAGE_SIZE}
          headerRowClassName="bg-surface-container-low/60"
          rowClassName={(_, i) =>
            [
              "hover:bg-primary/[0.03] transition-colors",
              i % 2 === 1 ? "bg-surface-container-low/30" : "",
            ].join(" ")
          }
          emptyText="Không có giao dịch nào."
        />

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
            <DataTable<PosTransactionItem>
              columns={[
                {
                  key: "medicineName",
                  header: "Sản phẩm",
                  render: (item) => (
                    <div>
                      <p className="font-semibold">{item.medicineName}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {item.medicineSku} · Lô: {item.lot}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "quantity",
                  header: "SL",
                  headerClassName: "text-right",
                  className: "text-right font-semibold",
                  render: (item) => String(item.quantity),
                },
                {
                  key: "unitPrice",
                  header: "Đơn giá",
                  headerClassName: "text-right",
                  className: "text-right",
                  render: (item) => `${fmt(item.unitPrice)}đ`,
                },
                {
                  key: "total",
                  header: "Thành tiền",
                  headerClassName: "text-right",
                  className: "text-right font-bold",
                  render: (item) => `${fmt(item.total)}đ`,
                },
              ]}
              data={detail.items}
              showIndex
              className="rounded-xl overflow-hidden"
              headerRowClassName="bg-surface-container-low"
              rowClassName={(_, idx) =>
                idx % 2 === 1 ? "bg-surface-container-low/30" : ""
              }
            />

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
