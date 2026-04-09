import { Badge } from "@/components/common";

const BEST_SELLERS = [
  {
    rank: 1,
    name: "Atorvastatin 20mg",
    category: "Tim mạch",
    sold: 2840,
    progress: 100,
    trend: "+14%",
  },
  {
    rank: 2,
    name: "Amoxicillin 500mg",
    category: "Kháng sinh",
    sold: 2210,
    progress: 78,
    trend: "+9%",
  },
  {
    rank: 3,
    name: "Omeprazole 20mg",
    category: "Tiêu hóa",
    sold: 1890,
    progress: 67,
    trend: "+5%",
  },
  {
    rank: 4,
    name: "Metformin 500mg",
    category: "Nội tiết",
    sold: 1640,
    progress: 58,
    trend: "+11%",
  },
  {
    rank: 5,
    name: "Ibuprofen 400mg",
    category: "Giảm đau",
    sold: 1380,
    progress: 49,
    trend: "-2%",
  },
  {
    rank: 6,
    name: "Amlodipine 5mg",
    category: "Tim mạch",
    sold: 1120,
    progress: 39,
    trend: "+7%",
  },
  {
    rank: 7,
    name: "Vitamin D3 1000IU",
    category: "Vitamin",
    sold: 980,
    progress: 35,
    trend: "+22%",
  },
];

export function BestSellersPanel() {
  return (
    <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Bán chạy nhất
          </p>
          <h4 className="text-xl font-headline font-bold text-on-surface">
            Top sản phẩm tháng này
          </h4>
        </div>
        <button className="text-xs font-label font-bold text-primary hover:text-primary/70 transition-colors">
          Xem tất cả →
        </button>
      </div>

      <div className="space-y-4">
        {BEST_SELLERS.map((item) => (
          <div key={item.rank} className="flex items-center gap-4 group">
            <span
              className={[
                "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-headline font-black flex-shrink-0",
                item.rank === 1
                  ? "bg-primary text-on-primary"
                  : item.rank <= 3
                    ? "bg-primary-container text-primary"
                    : "bg-surface-container-low text-on-surface-variant",
              ].join(" ")}
            >
              {item.rank}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-label font-semibold text-on-surface truncate">
                  {item.name}
                </span>
                <Badge variant="neutral">{item.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-surface-container rounded-full">
                  <div
                    className="h-full bg-primary-container rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-xs text-on-surface-variant w-16 text-right flex-shrink-0">
                  {item.sold.toLocaleString()} đv
                </span>
              </div>
            </div>

            <span
              className={[
                "text-xs font-label font-bold w-12 text-right flex-shrink-0",
                item.trend.startsWith("+") ? "text-green-600" : "text-error",
              ].join(" ")}
            >
              {item.trend}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
