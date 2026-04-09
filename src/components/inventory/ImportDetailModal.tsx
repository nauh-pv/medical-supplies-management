import { Modal, Button } from "@/components/common";

interface ImportProduct {
  icon: string;
  name: string;
  detail: string;
  unit: string;
  qty: number;
  unitPrice: string;
  total: string;
}

const mockProducts: ImportProduct[] = [
  {
    icon: "pill",
    name: "Amoxicillin 500mg",
    detail: "Kháng sinh • Hộp 100 viên",
    unit: "Hộp",
    qty: 50,
    unitPrice: "220.000đ",
    total: "11.000.000đ",
  },
  {
    icon: "vaccines",
    name: "Paracetamol 650mg",
    detail: "Giảm đau • Chai 500 viên",
    unit: "Chai",
    qty: 120,
    unitPrice: "85.000đ",
    total: "10.200.000đ",
  },
  {
    icon: "water_drop",
    name: "NaCl 0.9% 500ml",
    detail: "Dung dịch truyền • Chai",
    unit: "Chai",
    qty: 500,
    unitPrice: "18.000đ",
    total: "9.000.000đ",
  },
  {
    icon: "medical_mask",
    name: "Khẩu trang N95",
    detail: "Bảo hộ • Hộp 20 cái",
    unit: "Hộp",
    qty: 40,
    unitPrice: "375.000đ",
    total: "15.040.000đ",
  },
];

interface ImportDetailModalProps {
  open: boolean;
  importId: string;
  onClose: () => void;
}

export function ImportDetailModal({
  open,
  importId,
  onClose,
}: ImportDetailModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chi tiết đợt nhập hàng"
      subtitle={`Thông tin chi tiết về lô hàng dược phẩm ${importId}`}
      maxWidth="max-w-5xl"
    >
      <div className="px-8 py-6 space-y-8">
        {/* Bento summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Mã nhập kho",
              value: "#NK-20240524-001",
              highlight: false,
            },
            { label: "Ngày nhập", value: "24/05/2024", highlight: false },
            {
              label: "Nhà cung cấp",
              value: "PharmaGlobal Ltd.",
              highlight: false,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-5 bg-surface-container-low rounded-[1.5rem]"
            >
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="text-base font-bold text-on-surface truncate">
                {item.value}
              </p>
            </div>
          ))}
          <div className="p-5 bg-primary-container rounded-[1.5rem] relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-20%] w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[10px] font-bold text-on-primary-container/70 uppercase tracking-widest mb-1">
              Tổng giá trị
            </p>
            <p className="text-xl font-extrabold text-on-primary-container">
              45.240.000đ
            </p>
          </div>
        </div>

        {/* Products table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">
                list_alt
              </span>
              Danh mục sản phẩm
            </h3>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
              {mockProducts.length} loại thuốc
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant/10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container">
                  {[
                    "Tên thuốc",
                    "Đơn vị",
                    "Số lượng",
                    "Đơn giá",
                    "Thành tiền",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={[
                        "py-4 px-6 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest",
                        i >= 2 ? "text-right" : i === 1 ? "text-center" : "",
                      ].join(" ")}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest">
                {mockProducts.map((p, i) => (
                  <tr
                    key={i}
                    className={[
                      "hover:bg-primary/5 transition-colors",
                      i % 2 === 1 ? "bg-surface-container-low/40" : "",
                    ].join(" ")}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            {p.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">
                            {p.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {p.detail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-5 px-6 text-sm text-on-surface font-medium">
                      {p.unit}
                    </td>
                    <td className="text-right py-5 px-6 text-sm font-bold text-on-surface">
                      {p.qty}
                    </td>
                    <td className="text-right py-5 px-6 text-sm text-on-surface-variant">
                      {p.unitPrice}
                    </td>
                    <td className="text-right py-5 px-6 text-sm font-bold text-primary">
                      {p.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-outline-variant/10 gap-4">
          <div className="flex items-center gap-4">
            {[
              { color: "bg-green-500", label: "Đã đối soát" },
              { color: "bg-primary", label: "Đã nhập kho" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={["w-2 h-2 rounded-full", s.color].join(" ")} />
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="ghost"
              icon="print"
              className="flex-1 md:flex-none justify-center"
            >
              In phiếu
            </Button>
            <Button
              variant="ghost"
              icon="download"
              className="flex-1 md:flex-none justify-center"
            >
              Xuất Excel
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 md:flex-none justify-center px-8"
            >
              Hoàn tất xem
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
