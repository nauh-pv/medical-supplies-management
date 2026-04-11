import { Modal, Button, Badge } from "@/components/common";

interface DispatchItem {
  name: string;
  note?: string;
  qty: number;
  unit: string;
  total: string;
}

interface DispatchDetailModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
}

const mockItems: DispatchItem[] = [
  {
    name: "Remdesivir 100mg",
    note: "Bảo quản lạnh",
    qty: 50,
    unit: "Lọ",
    total: "25.000.000đ",
  },
  {
    name: "Dexamethasone 4mg/ml",
    qty: 200,
    unit: "Ống",
    total: "8.000.000đ",
  },
  {
    name: "Kim tiêm vô trùng 1ml",
    qty: 1000,
    unit: "Chiếc",
    total: "1.500.000đ",
  },
];

export function DispatchDetailModal({
  open,
  onClose,
  orderId,
}: DispatchDetailModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết đơn xuất kho"
      maxWidth="max-w-4xl"
    >
      {/* Sub-header: ID + date + status */}
      <div className="px-10 py-4 bg-surface-container-low/50 border-t border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">
              confirmation_number
            </span>
            ID: {orderId}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">event</span>
            24/05/2024 14:30
          </span>
        </div>
        <Badge variant="info">Đang vận chuyển</Badge>
      </div>

      {/* Body */}
      <div className="px-10 py-8 space-y-8 max-h-[500px] overflow-y-auto">
        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Chi nhánh nhận
            </p>
            <p className="font-bold text-on-surface">
              Bệnh viện Đa khoa Sài Gòn
            </p>
            <p className="text-sm text-on-surface-variant">
              125 Lê Lợi, Phường Bến Thành, Quận 1
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Ghi chú vận chuyển
            </p>
            <p className="text-sm text-on-surface-variant italic">
              "Yêu cầu bảo quản lạnh dưới 5°C. Liên hệ dược tá trước khi giao."
            </p>
          </div>
        </div>

        {/* Items table */}
        <div className="space-y-3">
          <h4 className="text-xs font-label font-bold uppercase tracking-widest text-on-surface flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full" />
            Danh mục vật tư xuất kho
          </h4>
          <div className="bg-surface-container-low rounded-[1.5rem] overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-dim/20">
                  {["Tên thuốc/Vật tư", "Đơn vị", "Số lượng", "Thành tiền"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {mockItems.map((item) => (
                  <tr key={item.name} className="bg-surface-container-lowest">
                    <td className="px-5 py-4">
                      <p className="font-bold text-on-surface text-sm">
                        {item.name}
                      </p>
                      {item.note && (
                        <p className="text-[10px] text-primary uppercase font-bold tracking-tight">
                          {item.note}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      {item.unit}
                    </td>
                    <td className="px-5 py-4 font-bold text-on-surface text-sm">
                      {item.qty.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-bold text-primary text-sm">
                      {item.total}
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-dim/10">
                  <td
                    colSpan={3}
                    className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant"
                  >
                    Tổng giá trị đơn hàng
                  </td>
                  <td className="px-5 py-4 font-headline font-black text-lg text-primary">
                    34.500.000đ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline + packages */}
        <div className="flex items-start gap-6">
          <div className="flex-1 bg-surface-container-low/50 rounded-[1.5rem] p-6 border-l-4 border-primary">
            <h5 className="text-xs font-label font-bold uppercase tracking-widest text-primary mb-4">
              Lịch trình vận hành
            </h5>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_0_4px_rgba(0,102,255,0.1)]" />
                  <div className="w-px flex-1 bg-outline-variant mt-2" />
                </div>
                <div className="pb-3">
                  <p className="text-xs font-bold text-on-surface">
                    Xác nhận xuất kho
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    24/05/2024 - 14:30 | Bởi Nguyễn Minh Châu
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-outline-variant mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-on-surface-variant">
                    Đang trên đường giao hàng
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    Đang cập nhật...
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-44 p-5 bg-surface-container-lowest border border-surface-container-high rounded-[1.5rem]">
            <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Tổng kiện hàng
            </p>
            <p className="text-3xl font-headline font-black text-primary">
              1,250
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/30 flex items-center justify-between">
        <Button variant="ghost" icon="print">
          In phiếu xuất
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
          <Button>Xác nhận hoàn tất</Button>
        </div>
      </div>
    </Modal>
  );
}
