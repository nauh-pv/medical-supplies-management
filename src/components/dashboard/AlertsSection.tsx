import { Badge, Button } from "@/components/common";
import type { StockAlert } from "@/services/dashboard";

interface AlertsSectionProps {
  alerts: StockAlert | null;
  loading: boolean;
}

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

const LOADING_ROWS = Array.from({ length: 2 }, (_, i) => i);

/** Expiring soon + low stock alert panels — real Firestore data. */
export function AlertsSection({ alerts, loading }: AlertsSectionProps) {
  const expiringSoon = alerts?.expiringSoon ?? [];
  const lowStock = alerts?.lowStock ?? [];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Expiring Soon */}
      <AlertCard
        icon="timer"
        iconBg="bg-error-container text-error"
        title="Sắp hết hạn"
        badgeLabel="Hạn dưới 30 ngày"
        badgeVariant="error"
      >
        {loading ? (
          LOADING_ROWS.map((i) => (
            <div
              key={i}
              className="h-14 bg-surface-container-low rounded-xl animate-pulse"
            />
          ))
        ) : expiringSoon.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-4">
            Không có lô hàng sắp hết hạn
          </p>
        ) : (
          expiringSoon.map((item) => (
            <div
              key={item.sku}
              className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    vaccines
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
                  {item.daysLeft} ngày còn lại
                </p>
                <p className="text-[10px] text-on-surface-variant">
                  {item.priority}
                </p>
              </div>
            </div>
          ))
        )}
      </AlertCard>

      {/* Low Stock */}
      <AlertCard
        icon="warning"
        iconBg="bg-tertiary-fixed text-tertiary"
        title="Cảnh báo tồn kho thấp"
        badgeLabel="Dưới mức tối thiểu"
        badgeVariant="warning"
      >
        {loading ? (
          LOADING_ROWS.map((i) => (
            <div
              key={i}
              className="h-14 bg-surface-container-low rounded-xl animate-pulse"
            />
          ))
        ) : lowStock.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-4">
            Tồn kho ổn định
          </p>
        ) : (
          lowStock.map((item) => (
            <div
              key={item.medicineId}
              className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    medication
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {item.medicineName}
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
          ))
        )}
      </AlertCard>
    </section>
  );
}
