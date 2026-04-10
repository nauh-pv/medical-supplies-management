import { Badge } from "@/components/common";
import { Button } from "@/components/common";

interface ExpiringItem {
  icon: string;
  name: string;
  sku: string;
  qty: string;
  daysLeft: number;
  priority: string;
}

interface LowStockItem {
  icon: string;
  name: string;
  current: number;
  minimum: number;
}

const expiringItems: ExpiringItem[] = [
  {
    icon: "vaccines",
    name: "Vắc-xin cúm Lô B-22",
    sku: "INF-2201",
    qty: "450 Đơn vị",
    daysLeft: 12,
    priority: "Ưu tiên xử lý: Cao",
  },
  {
    icon: "pill",
    name: "Amoxicillin 500mg dạng uống",
    sku: "AMOX-09",
    qty: "1.2K Đơn vị",
    daysLeft: 28,
    priority: "Đề xuất điều phối",
  },
];

const lowStockItems: LowStockItem[] = [
  {
    icon: "medical_services",
    name: "Găng tay phẫu thuật (Size M)",
    current: 120,
    minimum: 500,
  },
  {
    icon: "ecg_heart",
    name: "Giấy in nhiệt ECG (Cuộn)",
    current: 15,
    minimum: 40,
  },
];

function AlertCard({
  icon,
  iconBg,
  title,
  badgeLabel,
  badgeVariant,
  children,
}: {
  icon: string;
  iconBg: string;
  title: string;
  badgeLabel: string;
  badgeVariant: "error" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={["p-2 rounded-xl", iconBg].join(" ")}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <h4 className="font-headline font-bold text-lg text-on-surface">
            {title}
          </h4>
        </div>
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
      </div>
      <div className="space-y-4 flex-1">{children}</div>
      <div className="mt-6 text-center">
        <a
          href="#"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Xem thêm
        </a>
      </div>
    </div>
  );
}

/** Expiring soon + low stock alert panels. */
export function AlertsSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Expiring Soon */}
      <AlertCard
        icon="timer"
        iconBg="bg-error-container text-error"
        title="Sắp hết hạn"
        badgeLabel="Hạn dưới 90 ngày"
        badgeVariant="error"
      >
        {expiringItems.map((item) => (
          <div
            key={item.sku}
            className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {item.name}
                </p>
                <p className="text-xs text-on-surface-variant">
                  SKU: {item.sku} • {item.qty}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-error">
                {item.daysLeft} Ngày còn lại
              </p>
              <p className="text-[10px] text-on-surface-variant">
                {item.priority}
              </p>
            </div>
          </div>
        ))}
      </AlertCard>

      {/* Low Stock */}
      <AlertCard
        icon="warning"
        iconBg="bg-tertiary-fixed text-tertiary"
        title="Cảnh báo tồn kho thấp"
        badgeLabel="Dưới mức tối thiểu"
        badgeVariant="warning"
      >
        {lowStockItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {item.name}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Hiện tại: {item.current} • Tối thiểu: {item.minimum}
                </p>
              </div>
            </div>
            <Button size="sm" icon="add_shopping_cart">
              Nhập thêm
            </Button>
          </div>
        ))}
      </AlertCard>
    </section>
  );
}
