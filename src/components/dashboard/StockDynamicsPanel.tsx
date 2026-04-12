import { Button } from "@/components/common";
import type { RecentActivity } from "@/services/dashboard";

interface StockDynamicsPanelProps {
  activities: RecentActivity[];
  loading: boolean;
}

const LOADING_ROWS = Array.from({ length: 4 }, (_, i) => i);

/** Recent stock movement activity panel — real POS transaction data. */
export function StockDynamicsPanel({
  activities,
  loading,
}: StockDynamicsPanelProps) {
  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_20px_40px_rgba(0,80,203,0.03)]">
      <h4 className="font-headline font-bold text-xl text-on-surface mb-8">
        Giao dịch gần đây
      </h4>

      <div className="space-y-6">
        {loading ? (
          LOADING_ROWS.map((i) => (
            <div
              key={i}
              className="h-10 bg-surface-container-low rounded-xl animate-pulse"
            />
          ))
        ) : activities.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-4">
            Chưa có giao dịch nào
          </p>
        ) : (
          activities.map((event) => (
            <div key={event.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={["p-2 rounded-xl", event.iconBg].join(" ")}>
                  <span className="material-symbols-outlined">
                    {event.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface truncate max-w-[140px]">
                    {event.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {event.detail}
                  </p>
                </div>
              </div>
              <span
                className={[
                  "text-[10px] font-bold uppercase shrink-0",
                  event.timeLabelColor,
                ].join(" ")}
              >
                {event.timeLabel}
              </span>
            </div>
          ))
        )}
      </div>

      <Button variant="ghost" className="w-full justify-center mt-8">
        Xem lịch sử kho
      </Button>
    </div>
  );
}
