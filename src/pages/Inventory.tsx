import { useState } from "react";
import { PageHeader, Button } from "@/components/common";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryImportTab } from "@/components/inventory/InventoryImportTab";
import { AddMedicineModal } from "@/components/inventory/AddMedicineModal";
import { SetPriceModal } from "@/components/inventory/SetPriceModal";
import { UnitTable } from "@/components/units/UnitTable";

type InventoryTab = "medicines" | "imports" | "units";

export function Inventory() {
  const [tab, setTab] = useState<InventoryTab>("medicines");
  const [addOpen, setAddOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Cơ sở dữ liệu Thuốc
          </span>
        }
        title="Quản lý Kho Tổng"
        titleSize="text-4xl"
        actions={
          tab === "medicines" ? (
            <>
              <Button
                variant="ghost"
                icon="payments"
                onClick={() => setPriceOpen(true)}
              >
                Thiết lập giá
              </Button>
              <Button icon="add" onClick={() => setAddOpen(true)}>
                Thêm thuốc mới
              </Button>
            </>
          ) : null
        }
        subtitle={
          tab === "units"
            ? "Quản lý các đơn vị đo lường cho dược phẩm và vật tư y tế trong hệ thống kho."
            : undefined
        }
      />

      <InventoryStats />

      {/* Tab navigation */}
      <div className="flex gap-8 border-b border-outline-variant/20">
        {[
          { id: "medicines" as InventoryTab, label: "Kho thuốc" },
          { id: "imports" as InventoryTab, label: "Quản lý nhập kho" },
          { id: "units" as InventoryTab, label: "Đơn vị tính" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "pb-4 px-2 text-sm font-medium transition-all",
              tab === t.id
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "medicines" && <InventoryTable />}
      {tab === "imports" && <InventoryImportTab />}
      {tab === "units" && <UnitTable />}

      <AddMedicineModal open={addOpen} onClose={() => setAddOpen(false)} />
      <SetPriceModal open={priceOpen} onClose={() => setPriceOpen(false)} />
    </main>
  );
}
