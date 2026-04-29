import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, TabBar } from "@/components/common";
import {
  getNearExpiryBatches,
  getLowStockAlerts,
  getBranches,
} from "@/services/inventory";
import type { BatchDoc, InventoryDoc, UserDoc } from "@/types/firestore";

const TABS = [
  { id: "expiry", label: "Thuốc sắp hết hạn" },
  { id: "low-stock", label: "Tồn kho thấp" },
] as const;
type TabId = (typeof TABS)[number]["id"];

interface LocationOption {
  id: string;
  label: string;
}

function getMs(ts: unknown): number {
  const t = ts as { toMillis?: () => number; seconds?: number };
  return t?.toMillis?.() ?? (t?.seconds ?? 0) * 1000;
}

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysLeftBadge(daysLeft: number) {
  if (daysLeft <= 14) return { variant: "error" as const, pulse: true };
  if (daysLeft <= 30) return { variant: "warning" as const, pulse: true };
  return { variant: "info" as const, pulse: false };
}

function PulsingDot({ variant }: { variant: "error" | "warning" }) {
  const color = variant === "error" ? "bg-error" : "bg-amber-500";
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={[
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          color,
        ].join(" ")}
      />
      <span
        className={["relative inline-flex rounded-full h-2 w-2", color].join(
          " ",
        )}
      />
    </span>
  );
}

export function ExpiryTable() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("expiry");
  const [locationId, setLocationId] = useState("WAREHOUSE");
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [expiryItems, setExpiryItems] = useState<BatchDoc[]>([]);
  const [lowItems, setLowItems] = useState<InventoryDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Load branch list once on mount
  useEffect(() => {
    getBranches().then((branches: UserDoc[]) => {
      setLocations([
        { id: "WAREHOUSE", label: "Kho tổng" },
        ...branches.map((b) => ({
          id: b.branchId ?? b.uid,
          label: b.branchName ?? b.displayName,
        })),
      ]);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getNearExpiryBatches(locationId),
      getLowStockAlerts(locationId),
    ]).then(([expiry, low]) => {
      setExpiryItems(expiry);
      setLowItems(low);
      setLoading(false);
    });
  }, [locationId]);

  const activeItems = tab === "expiry" ? expiryItems : lowItems;

  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
      {/* Tab + location filter header */}
      <div className="px-8 pt-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <TabBar
            tabs={TABS}
            activeTab={tab}
            onTabChange={(id) => setTab(id as TabId)}
            variant="pill"
          />
          <select
            className="bg-surface-container-low rounded-xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="px-8 pb-6 text-sm text-on-surface-variant">Đang tải...</p>
      ) : activeItems.length === 0 ? (
        <p className="px-8 pb-6 text-sm text-on-surface-variant">
          Không có dữ liệu cảnh báo tại vị trí này.
        </p>
      ) : tab === "expiry" ? (
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              {["Tên thuốc", "Số lô", "Ngày hết hạn", "Còn lại", "Tồn kho", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-8 py-3 text-left text-[10px] font-label font-bold uppercase tracking-[0.08em] text-on-surface-variant"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {(activeItems as BatchDoc[]).map((item, idx) => {
              const ms = getMs(item.expiryDate);
              const badge = daysLeftBadge(
                Math.ceil((ms - Date.now()) / (1000 * 60 * 60 * 24)),
              );
              const daysLeft = Math.ceil(
                (ms - Date.now()) / (1000 * 60 * 60 * 24),
              );
              return (
                <tr
                  key={item.id}
                  className={[
                    "group transition-colors hover:bg-surface-bright",
                    idx % 2 === 0
                      ? "bg-surface-container-lowest"
                      : "bg-surface-container-low/30",
                  ].join(" ")}
                >
                  <td className="px-8 py-4">
                    <p className="text-sm font-label font-semibold text-on-surface">
                      {item.medicineName}
                    </p>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-mono text-on-surface-variant">
                      {item.lot}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm text-on-surface">
                      {formatDate(ms)}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      {badge.pulse && (
                        <PulsingDot
                          variant={
                            badge.variant === "error" ? "error" : "warning"
                          }
                        />
                      )}
                      <Badge variant={badge.variant}>
                        {daysLeft < 0 ? "Đã hết hạn" : `${daysLeft} ngày`}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm text-on-surface">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Button
                      variant="ghost"
                      icon="send"
                      size="sm"
                      onClick={() => navigate("/dispatches")}
                    >
                      Điều phối
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low">
              {["Tên thuốc", "SKU", "Tồn kho", "Tối thiểu", "Mức độ", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-8 py-3 text-left text-[10px] font-label font-bold uppercase tracking-[0.08em] text-on-surface-variant"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {(activeItems as InventoryDoc[]).map((item, idx) => {
              const ratio =
                item.minStockLevel > 0
                  ? item.quantity / item.minStockLevel
                  : 0;
              const isUrgent = item.quantity === 0 || ratio < 0.3;
              return (
                <tr
                  key={item.id}
                  className={[
                    "group transition-colors hover:bg-surface-bright",
                    idx % 2 === 0
                      ? "bg-surface-container-lowest"
                      : "bg-surface-container-low/30",
                  ].join(" ")}
                >
                  <td className="px-8 py-4">
                    <p className="text-sm font-label font-semibold text-on-surface">
                      {item.medicineName}
                    </p>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-mono text-on-surface-variant">
                      {item.medicineSku}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="font-bold text-error">{item.quantity}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm text-on-surface-variant">
                      {item.minStockLevel}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <Badge variant={isUrgent ? "error" : "warning"}>
                      {isUrgent ? "Khẩn cấp" : "Cảnh báo"}
                    </Badge>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Button
                      variant="ghost"
                      icon="add_shopping_cart"
                      size="sm"
                      onClick={() => navigate("/inventory")}
                    >
                      Nhập thêm
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
