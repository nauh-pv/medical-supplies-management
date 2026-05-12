function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

interface SettlementSummaryCardsProps {
  totalRevenue: number;
  totalProfit: number;
}

export function SettlementSummaryCards({
  totalRevenue,
  totalProfit,
}: SettlementSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Gradient card — Doanh thu */}
      <div className="rounded-[1.5rem] bg-gradient-to-br from-primary to-primary-container p-6 flex flex-col justify-between min-h-[120px]">
        <div className="flex justify-between items-start">
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-primary/60">
            Tổng doanh thu bán lẻ
          </p>
          <span className="material-symbols-outlined text-on-primary/80 text-2xl">
            point_of_sale
          </span>
        </div>
        <div>
          <h4 className="text-2xl font-headline font-black text-on-primary mt-3">
            {fmt(totalRevenue)}
          </h4>
          <span className="text-on-primary/60 text-xs mt-1 block">
            VNĐ trong tháng
          </span>
        </div>
      </div>

      {/* Surface card — Lợi nhuận */}
      <div className="rounded-[1.5rem] bg-surface-container-lowest p-6 flex flex-col justify-between min-h-[120px] shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
        <div className="flex justify-between items-start">
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
            Lợi nhuận gộp
          </p>
          <span className="material-symbols-outlined text-primary text-2xl">
            trending_up
          </span>
        </div>
        <div>
          <h4 className="text-2xl font-headline font-black text-on-surface mt-3">
            {fmt(totalProfit)}
          </h4>
          <span className="text-on-surface-variant text-xs mt-1 block">
            VNĐ trong tháng
          </span>
        </div>
      </div>
    </div>
  );
}
