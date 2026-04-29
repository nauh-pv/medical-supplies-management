import { useState, useEffect } from "react";
import { Badge, Button } from "@/components/common";
import { getLowStockAlerts } from "@/services/inventory";
import type { InventoryDoc } from "@/types/firestore";

const MAX_DEFAULT = 5;

interface LowStockGridProps {
  onSeeMore?: () => void;
}

function urgencyFor(item: InventoryDoc) {
  const ratio = item.minStockLevel > 0 ? item.quantity / item.minStockLevel : 0;
  const isUrgent = item.quantity === 0 || ratio < 0.3;
  return {
    label: isUrgent ? "Khẩn cấp" : "Cảnh báo",
    badgeVariant: isUrgent ? ("error" as const) : ("warning" as const),
    iconColor: isUrgent ? "text-error" : "text-amber-700",
    iconBg: isUrgent ? "bg-error-container" : "bg-amber-100",
    barColor: isUrgent ? "bg-error" : "bg-amber-500",
    ratio,
  };
}

export function LowStockGrid({ onSeeMore }: LowStockGridProps) {
  const [items, setItems] = useState<InventoryDoc[]>([]);
  const [loading, setLoading] = useState(true); // start as loading; only set false in callback

  useEffect(() => {
    getLowStockAlerts("WAREHOUSE").then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-on-surface-variant py-4">Đang tải...</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant py-4">
        Không có mặt hàng tồn kho thấp tại kho tổng.
      </p>
    );
  }

  const displayed = items.slice(0, MAX_DEFAULT);
  const remaining = items.length - MAX_DEFAULT;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-5">
        {displayed.map((item) => {
          const u = urgencyFor(item);
          return (
            <div
              key={item.id}
              className="group bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_20px_40px_rgba(0,80,203,0.03)] flex flex-col gap-4 hover:shadow-[0_20px_40px_rgba(0,80,203,0.08)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div
                  className={[
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    u.iconBg,
                  ].join(" ")}
                >
                  <span
                    className={[
                      "material-symbols-outlined text-xl",
                      u.iconColor,
                    ].join(" ")}
                  >
                    medication
                  </span>
                </div>
                <Badge variant={u.badgeVariant}>{u.label}</Badge>
              </div>

              <div>
                <p className="text-sm font-label font-semibold text-on-surface mb-3">
                  {item.medicineName}
                </p>
                <div className="flex items-end justify-between text-xs text-on-surface-variant mb-2">
                  <span>
                    Hiện tại:{" "}
                    <span className="font-bold text-error">{item.quantity}</span>
                  </span>
                  <span>Tối thiểu: {item.minStockLevel}</span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full">
                  <div
                    className={["h-full rounded-full", u.barColor].join(" ")}
                    style={{
                      width: `${Math.min(u.ratio * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                icon="add_shopping_cart"
                className="w-full justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Đặt nhập thêm
              </Button>
            </div>
          );
        })}
      </div>

      {remaining > 0 && onSeeMore && (
        <div className="flex justify-end">
          <Button variant="ghost" icon="expand_more" onClick={onSeeMore}>
            Xem thêm{remaining > 0 ? ` (còn ${remaining} mặt hàng)` : ""}
          </Button>
        </div>
      )}
    </div>
  );
}

