import { Modal, Button, Badge } from "@/components/common";

interface BatchRow {
  lot: string;
  date: string;
  supplier: string;
  qty: number;
  unit: string;
  price: string;
  expiry: string;
  isNearExpiry: boolean;
}

const mockBatches: BatchRow[] = [
  {
    lot: "LOT20230815A",
    date: "15/08/2023",
    supplier: "PharmaCorp Vietnam",
    qty: 5000,
    unit: "Viên",
    price: "1.200",
    expiry: "20/08/2025",
    isNearExpiry: false,
  },
  {
    lot: "LOT20230910B",
    date: "10/09/2023",
    supplier: "MediGlobal Supply",
    qty: 2450,
    unit: "Viên",
    price: "1.300",
    expiry: "10/09/2025",
    isNearExpiry: false,
  },
  {
    lot: "LOT20220105X",
    date: "05/01/2022",
    supplier: "Dược phẩm TW1",
    qty: 1000,
    unit: "Viên",
    price: "1.150",
    expiry: "01/12/2023",
    isNearExpiry: true,
  },
  {
    lot: "LOT20231120C",
    date: "20/11/2023",
    supplier: "BioTech Solutions",
    qty: 4000,
    unit: "Viên",
    price: "1.250",
    expiry: "15/11/2026",
    isNearExpiry: false,
  },
  {
    lot: "LOT20231201D",
    date: "01/12/2023",
    supplier: "PharmaCorp Vietnam",
    qty: 10000,
    unit: "Viên",
    price: "1.200",
    expiry: "01/12/2026",
    isNearExpiry: false,
  },
];

interface BatchHistoryModalProps {
  open: boolean;
  onClose: () => void;
  medicineName: string;
  medicineCategory: string;
  sku: string;
}

export function BatchHistoryModal({
  open,
  onClose,
  medicineName,
  sku,
}: Omit<BatchHistoryModalProps, "medicineCategory">) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Lịch sử nhập kho theo lô`}
      subtitle={`${medicineName} · SKU: ${sku}`}
      maxWidth="max-w-5xl"
    >
      {/* Stats bar */}
      <div className="px-10 py-5 grid grid-cols-4 gap-6 bg-surface-container-low/50 border-t border-outline-variant/10">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
            Tổng tồn kho
          </span>
          <span className="text-xl font-headline font-extrabold text-primary">
            12.450{" "}
            <small className="text-sm font-normal text-on-surface-variant">
              Viên
            </small>
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
            Số lô hiện hành
          </span>
          <span className="text-xl font-headline font-extrabold text-on-surface">
            08
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
            Lô sắp hết hạn
          </span>
          <span className="text-xl font-headline font-extrabold text-error">
            02
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-widest">
            Giá nhập TB
          </span>
          <span className="text-xl font-headline font-extrabold text-on-surface">
            1.250{" "}
            <small className="text-sm font-normal text-on-surface-variant">
              VNĐ
            </small>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[400px] overflow-y-auto px-10 py-6">
        <table className="w-full text-left border-separate border-spacing-y-1.5">
          <thead>
            <tr>
              <th className="px-4 py-3 text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant">
                Số lô
              </th>
              <th className="px-4 py-3 text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant">
                Ngày nhập
              </th>
              <th className="px-4 py-3 text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant">
                Nhà cung cấp
              </th>
              <th className="px-4 py-3 text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant text-right">
                Số lượng nhập
              </th>
              <th className="px-4 py-3 text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant text-center">
                Đơn vị
              </th>
              <th className="px-4 py-3 text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant text-right">
                Giá nhập (VNĐ)
              </th>
              <th className="px-4 py-3 text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant">
                Hạn sử dụng
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mockBatches.map((row, i) => (
              <tr
                key={row.lot}
                className={[
                  "hover:bg-surface-bright transition-colors",
                  i % 2 === 1 ? "bg-surface-container-low/30" : "",
                ].join(" ")}
              >
                <td className="px-4 py-4 font-bold text-primary">{row.lot}</td>
                <td className="px-4 py-4 text-on-surface-variant">
                  {row.date}
                </td>
                <td className="px-4 py-4 font-medium text-on-surface">
                  {row.supplier}
                </td>
                <td className="px-4 py-4 text-right font-bold text-on-surface">
                  {row.qty.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-center text-on-surface-variant">
                  {row.unit}
                </td>
                <td className="px-4 py-4 text-right text-on-surface-variant">
                  {row.price}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={row.isNearExpiry ? "error" : "info"}>
                    {row.expiry}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant italic">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">
            info
          </span>
          Nhấn vào mã lô để xem chi tiết chứng từ nhập liên quan.
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" icon="download">
            Xuất báo cáo
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </Modal>
  );
}
