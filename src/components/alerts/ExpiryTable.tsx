import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, TabBar, DataTable, Select, Pagination } from "@/components/common";
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
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // Load branch list once on mount
  useEffect(() => {
    getBranches().then((branches: UserDoc[]) => {
      const listBranchesValid = branches.filter((b) => b.status === "active");
      setLocations([
        { id: "WAREHOUSE", label: "Kho tổng" },
        ...listBranchesValid.map((b) => ({
          id: b.branchId ?? b.uid,
          label: b.branchName ?? b.displayName,
        })),
      ]);
    });
  }, []);

  useEffect(() => {
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
  const totalPages = Math.max(1, Math.ceil(activeItems.length / ITEMS_PER_PAGE));
  const pagedItems = activeItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,80,203,0.03)] overflow-hidden">
      {/* Tab + location filter header */}
      <div className="px-8 pt-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <TabBar
            tabs={TABS}
            activeTab={tab}
            onTabChange={(id) => {
              setTab(id as TabId);
              setPage(1);
            }}
            variant="pill"
          />
          <div className="w-48">
            <Select
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                setPage(1);
              }}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {tab === "expiry" ? (
        <DataTable<BatchDoc>
          columns={[
            {
              key: "medicineName",
              header: "Tên thuốc",
              render: (item) => (
                <p className="text-sm font-label font-semibold text-on-surface">
                  {item.medicineName}
                </p>
              ),
            },
            {
              key: "lot",
              header: "Số lô",
              render: (item) => (
                <span className="text-xs font-mono text-on-surface-variant">
                  {item.lot}
                </span>
              ),
            },
            {
              key: "expiryDate",
              header: "Ngày hết hạn",
              render: (item) => (
                <span className="text-sm text-on-surface">
                  {formatDate(getMs(item.expiryDate))}
                </span>
              ),
            },
            {
              key: "daysLeft",
              header: "Còn lại",
              render: (item) => {
                const ms = getMs(item.expiryDate);
                const daysLeft = Math.ceil(
                  (ms - Date.now()) / (1000 * 60 * 60 * 24),
                );
                const badge = daysLeftBadge(daysLeft);
                return (
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
                );
              },
            },
            {
              key: "quantity",
              header: "Tồn kho",
              render: (item) => (
                <span className="text-sm text-on-surface">{item.quantity}</span>
              ),
            },
            {
              key: "action",
              header: "",
              className: "text-right",
              render: () => (
                <Button
                  variant="ghost"
                  icon="send"
                  size="sm"
                  onClick={() => navigate("/dispatches")}
                >
                  Điều phối
                </Button>
              ),
            },
          ]}
          data={pagedItems as BatchDoc[]}
          keyField="id"
          loading={loading}
          showIndex
          indexOffset={(page - 1) * ITEMS_PER_PAGE}
          headerRowClassName="bg-surface-container-low"
          emptyText="Không có dữ liệu cảnh báo tại vị trí này."
        />
      ) : (
        <DataTable<InventoryDoc>
          columns={[
            {
              key: "medicineName",
              header: "Tên thuốc",
              render: (item) => (
                <p className="text-sm font-label font-semibold text-on-surface">
                  {item.medicineName}
                </p>
              ),
            },
            {
              key: "medicineSku",
              header: "SKU",
              render: (item) => (
                <span className="text-xs font-mono text-on-surface-variant">
                  {item.medicineSku}
                </span>
              ),
            },
            {
              key: "quantity",
              header: "Tồn kho",
              render: (item) => (
                <span className="font-bold text-error">{item.quantity}</span>
              ),
            },
            {
              key: "minStockLevel",
              header: "Tối thiểu",
              render: (item) => (
                <span className="text-sm text-on-surface-variant">
                  {item.minStockLevel}
                </span>
              ),
            },
            {
              key: "severity",
              header: "Mức độ",
              render: (item) => {
                const ratio =
                  item.minStockLevel > 0
                    ? item.quantity / item.minStockLevel
                    : 0;
                const isUrgent = item.quantity === 0 || ratio < 0.3;
                return (
                  <Badge variant={isUrgent ? "error" : "warning"}>
                    {isUrgent ? "Khẩn cấp" : "Cảnh báo"}
                  </Badge>
                );
              },
            },
            {
              key: "action",
              header: "",
              className: "text-right",
              render: () => (
                <Button
                  variant="ghost"
                  icon="add_shopping_cart"
                  size="sm"
                  onClick={() => navigate("/inventory")}
                >
                  Nhập thêm
                </Button>
              ),
            },
          ]}
          data={pagedItems as InventoryDoc[]}
          keyField="id"
          loading={loading}
          showIndex
          indexOffset={(page - 1) * ITEMS_PER_PAGE}
          headerRowClassName="bg-surface-container-low"
          emptyText="Không có dữ liệu cảnh báo tại vị trí này."
        />
      )}

      {/* Pagination footer */}
      {!loading && activeItems.length > ITEMS_PER_PAGE && (
        <div className="px-8 py-5 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
          <p className="text-sm text-on-surface-variant">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, activeItems.length)}
            </span>{" "}
            của {activeItems.length} mục
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
