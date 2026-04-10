import { useState } from "react";
import { Modal, Button } from "@/components/common";

interface ImportProduct {
  id: number;
  name: string;
  qty: number;
  unit: string;
  unitPrice: string;
  total: string;
}

const mockProducts: ImportProduct[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    qty: 100,
    unit: "Hộp",
    unitPrice: "45.000",
    total: "4.500.000 đ",
  },
];

interface CreateImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateImportModal({ open, onClose }: CreateImportModalProps) {
  const [products] = useState<ImportProduct[]>(mockProducts);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nhập hàng thủ công"
      subtitle="Tạo đơn nhập kho mới cho hệ thống"
      maxWidth="max-w-4xl"
    >
      <div className="px-8 py-6 space-y-8">
        {/* Section 1: General info */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary text-lg">
              info
            </span>
            <h3 className="font-bold text-on-surface uppercase text-xs tracking-[0.2em] font-headline">
              Thông tin chung
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Nhà cung cấp
              </label>
              <div className="relative">
                <select className="w-full h-11 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pl-4 pr-10 text-on-surface outline-none">
                  <option value="">Chọn nhà cung cấp...</option>
                  <option>Pharma Group VN</option>
                  <option>Medical Tech Inc</option>
                  <option>VinaMed Supply</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Ngày nhập
              </label>
              <input
                type="date"
                className="w-full h-11 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                defaultValue="2023-10-25"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Người thực hiện
              </label>
              <input
                type="text"
                className="w-full h-11 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                placeholder="Họ và tên..."
              />
            </div>
          </div>
        </section>

        {/* Section 2: Product list */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                inventory_2
              </span>
              <h3 className="font-bold text-on-surface uppercase text-xs tracking-[0.2em] font-headline">
                Danh sách sản phẩm
              </h3>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-base">
                add_circle
              </span>
              Thêm sản phẩm
            </button>
          </div>

          <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {[
                    "Sản phẩm",
                    "Số lượng",
                    "Đơn vị",
                    "Đơn giá",
                    "Thành tiền",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={[
                        "px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant",
                        i === 1
                          ? "text-center w-32"
                          : i >= 3
                            ? "text-right"
                            : "",
                      ].join(" ")}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-container-low/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="relative">
                        <select className="w-full border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 appearance-none text-on-surface outline-none">
                          <option>{p.name}</option>
                          <option>Amoxicillin 250mg</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <input
                          type="number"
                          defaultValue={p.qty}
                          className="w-20 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-center py-1.5 h-9 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant font-medium">
                      {p.unit}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <input
                        type="text"
                        defaultValue={p.unitPrice}
                        className="w-full border-none bg-transparent p-0 text-sm text-right font-semibold focus:ring-0 text-on-surface-variant outline-none"
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-on-surface">
                        {p.total}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="text-on-surface-variant/40 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Summary */}
        <section className="bg-primary/5 p-6 rounded-xl flex justify-between items-center border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">
                payments
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
                Tổng cộng thanh toán
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Đã bao gồm thuế GTGT (nếu có)
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-primary font-headline">
              4.500.000{" "}
              <span className="text-base font-medium text-primary/70">đ</span>
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-lowest">
        <Button variant="ghost" onClick={onClose}>
          Hủy bỏ
        </Button>
        <Button icon="check_circle">Xác nhận nhập kho</Button>
      </div>
    </Modal>
  );
}
