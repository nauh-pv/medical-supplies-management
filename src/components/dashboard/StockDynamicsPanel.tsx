import { Button } from "@/components/common";

interface StockEvent {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  detail: string;
  timeLabel: string;
  timeLabelColor: string;
}

const events: StockEvent[] = [
  {
    id: "1",
    icon: "call_received",
    iconBg: "bg-green-50 text-green-600",
    name: "Insulin Glargine",
    detail: "Vừa nhập +500 đơn vị",
    timeLabel: "Vừa xong",
    timeLabelColor: "text-on-surface-variant",
  },
  {
    id: "2",
    icon: "sync",
    iconBg: "bg-primary/10 text-primary",
    name: "Vitamin C 1000mg",
    detail: "Tỉ lệ xoay vòng cao: 4.5x",
    timeLabel: "HOT",
    timeLabelColor: "text-primary",
  },
  {
    id: "3",
    icon: "call_made",
    iconBg: "bg-error-container text-error",
    name: "Cồn Y tế 70 độ",
    detail: "Xuất kho lớn: -1.2K chai",
    timeLabel: "1 giờ trước",
    timeLabelColor: "text-on-surface-variant",
  },
  {
    id: "4",
    icon: "inventory",
    iconBg: "bg-surface-container text-on-surface-variant",
    name: "Băng gạc tiệt trùng",
    detail: "Đang kiểm kê định kỳ",
    timeLabel: "2 giờ trước",
    timeLabelColor: "text-on-surface-variant",
  },
];

/** Recent stock movement activity panel. */
export function StockDynamicsPanel() {
  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
      <h4 className="font-headline font-bold text-xl text-on-surface mb-8">
        Biến động tồn kho
      </h4>

      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={["p-2 rounded-xl", event.iconBg].join(" ")}>
                <span className="material-symbols-outlined">{event.icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {event.name}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {event.detail}
                </p>
              </div>
            </div>
            <span
              className={[
                "text-[10px] font-bold uppercase",
                event.timeLabelColor,
              ].join(" ")}
            >
              {event.timeLabel}
            </span>
          </div>
        ))}
      </div>

      <Button variant="ghost" className="w-full justify-center mt-8">
        Xem lịch sử kho
      </Button>
    </div>
  );
}
