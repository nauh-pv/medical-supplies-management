import { useState } from "react";
import { Input, Button } from "@/components/common";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface OrderSummaryProps {
  items: CartItem[];
  onQtyChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout?: (
    paymentMethod: "cash" | "card" | "transfer",
    discount: number,
  ) => Promise<void>;
  checkingOut?: boolean;
}

const VAT_RATE = 0.08;

export function OrderSummary({
  items,
  onQtyChange,
  onRemove,
  onCheckout,
  checkingOut,
}: OrderSummaryProps) {
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "transfer"
  >("cash");
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat - discount;

  return (
    <div className="w-[400px] flex-shrink-0 flex flex-col bg-surface-container-lowest border-l border-surface-container-low h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-surface-container-low">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-headline font-bold text-on-surface">
            Đơn hàng
          </h3>
          {items.length > 0 && (
            <button
              onClick={() => items.forEach((i) => onRemove(i.id))}
              className="text-xs font-label font-semibold text-error hover:text-error/70 transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>
        <Input placeholder="Tên hoặc SĐT khách hàng" leadingIcon="person" />
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">
              shopping_cart
            </span>
            <p className="text-sm text-on-surface-variant">Giỏ hàng trống</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              Chọn sản phẩm bên trái để thêm
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-label font-semibold text-on-surface truncate">
                  {item.name}
                </p>
                <p className="text-xs text-primary font-mono mt-0.5">
                  {item.price.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onQtyChange(item.id, -1)}
                  className="w-6 h-6 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    remove
                  </span>
                </button>
                <span className="w-7 text-center text-sm font-label font-bold text-on-surface">
                  {item.qty}
                </span>
                <button
                  onClick={() => onQtyChange(item.id, 1)}
                  className="w-6 h-6 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="text-on-surface-variant hover:text-error transition-colors flex-shrink-0 ml-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="px-6 py-5 border-t border-surface-container-low space-y-3">
          {/* Payment method */}
          <div className="flex gap-2">
            {(["cash", "card", "transfer"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={[
                  "flex-1 py-1.5 rounded-xl text-xs font-label font-semibold transition-all",
                  paymentMethod === m
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
                ].join(" ")}
              >
                {{ cash: "Tiền mặt", card: "Thẻ", transfer: "Chuyển khoản" }[m]}
              </button>
            ))}
          </div>

          {/* Discount input */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant whitespace-nowrap">
              Giảm giá (₫):
            </label>
            <input
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="flex-1 bg-surface-container-low rounded-xl text-sm text-right font-mono px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            {[
              { label: "Tạm tính", value: subtotal },
              { label: `VAT (${VAT_RATE * 100}%)`, value: vat },
              { label: "Giảm giá", value: -discount },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{label}</span>
                <span
                  className={[
                    "font-mono font-semibold",
                    value < 0 ? "text-green-600" : "text-on-surface",
                  ].join(" ")}
                >
                  {value < 0 ? "-" : ""}
                  {Math.abs(value).toLocaleString("vi-VN")}₫
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-surface-container-low">
            <span className="font-label font-bold text-on-surface">
              Tổng cộng
            </span>
            <span className="text-xl font-headline font-black text-primary">
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>

          <Button
            icon={checkingOut ? "progress_activity" : "payments"}
            className="w-full justify-center"
            onClick={() => onCheckout?.(paymentMethod, discount)}
          >
            {checkingOut ? "Đang xử lý..." : "Thanh toán"}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" icon="print" className="justify-center">
              In đơn nháp
            </Button>
            <Button variant="ghost" icon="update" className="justify-center">
              Chờ xử lý
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
