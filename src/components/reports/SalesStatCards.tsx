function fmt(value: number): string {
  return value.toLocaleString("vi-VN");
}

interface SalesStatCardsProps {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  loading: boolean;
}

export function SalesStatCards({
  totalRevenue,
  totalProfit,
  totalOrders,
  loading,
}: SalesStatCardsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Revenue */}
      <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <span className="material-symbols-outlined text-[120px] text-primary">
            payments
          </span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1 font-label">
            Tổng doanh thu bán lẻ
          </p>
          <h3 className="text-3xl font-extrabold font-headline text-on-surface">
            {loading ? "—" : fmt(totalRevenue)}{" "}
            <span className="text-sm font-medium">VNĐ</span>
          </h3>
        </div>
      </div>

      {/* Total Profit */}
      <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <span className="material-symbols-outlined text-[120px] text-green-600">
            trending_up
          </span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1 font-label">
            Lợi nhuận
          </p>
          <h3 className="text-3xl font-extrabold font-headline text-on-surface">
            {loading ? "—" : fmt(totalProfit)}{" "}
            <span className="text-sm font-medium">VNĐ</span>
          </h3>
        </div>
      </div>

      {/* Total Orders */}
      <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <span className="material-symbols-outlined text-[120px] text-secondary">
            receipt_long
          </span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1 font-label">
            Tổng số đơn hàng
          </p>
          <h3 className="text-3xl font-extrabold font-headline text-on-surface">
            {loading ? "—" : fmt(totalOrders)}{" "}
            <span className="text-sm font-medium">Giao dịch</span>
          </h3>
        </div>
      </div>
    </section>
  );
}
