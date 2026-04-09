import { Badge, Button } from "@/components/common";

const LOW_STOCK_ITEMS = [
  {
    id: "LS001",
    name: "Amoxicillin 500mg",
    icon: "medication",
    iconBg: "bg-red-50",
    iconColor: "text-error",
    current: 12,
    minimum: 50,
    urgency: "Khẩn cấp" as const,
  },
  {
    id: "LS002",
    name: "Metformin 500mg",
    icon: "medication",
    iconBg: "bg-orange-50",
    iconColor: "text-warning",
    current: 28,
    minimum: 60,
    urgency: "Cảnh báo" as const,
  },
  {
    id: "LS003",
    name: "Vitamin B12 1mg",
    icon: "vitamins",
    iconBg: "bg-orange-50",
    iconColor: "text-warning",
    current: 35,
    minimum: 80,
    urgency: "Cảnh báo" as const,
  },
  {
    id: "LS004",
    name: "Bông y tế vô trùng",
    icon: "medical_services",
    iconBg: "bg-red-50",
    iconColor: "text-error",
    current: 5,
    minimum: 40,
    urgency: "Khẩn cấp" as const,
  },
];

const URGENCY_BADGE: Record<string, "error" | "warning"> = {
  "Khẩn cấp": "error",
  "Cảnh báo": "warning",
};

export function LowStockGrid() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
      {LOW_STOCK_ITEMS.map((item) => (
        <div
          key={item.id}
          className="group bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_20px_40px_rgba(0,80,203,0.03)] flex flex-col gap-4 hover:shadow-[0_20px_40px_rgba(0,80,203,0.08)] transition-all"
        >
          <div className="flex items-start justify-between">
            <div
              className={[
                "w-11 h-11 rounded-xl flex items-center justify-center",
                item.iconBg,
              ].join(" ")}
            >
              <span
                className={[
                  "material-symbols-outlined text-xl",
                  item.iconColor,
                ].join(" ")}
              >
                {item.icon}
              </span>
            </div>
            <Badge variant={URGENCY_BADGE[item.urgency]}>{item.urgency}</Badge>
          </div>

          <div>
            <p className="text-sm font-label font-semibold text-on-surface mb-3">
              {item.name}
            </p>
            <div className="flex items-end justify-between text-xs text-on-surface-variant mb-2">
              <span>
                Hiện tại:{" "}
                <span className="font-bold text-error">{item.current}</span>
              </span>
              <span>Tối thiểu: {item.minimum}</span>
            </div>
            <div className="h-1.5 bg-surface-container rounded-full">
              <div
                className={[
                  "h-full rounded-full",
                  item.current / item.minimum < 0.3 ? "bg-error" : "bg-warning",
                ].join(" ")}
                style={{
                  width: `${Math.min((item.current / item.minimum) * 100, 100)}%`,
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
      ))}
    </div>
  );
}
