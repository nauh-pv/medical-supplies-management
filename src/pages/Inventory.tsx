import { useState, useEffect } from "react";
import { PageHeader, TabBar } from "@/components/common";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryImportTab } from "@/components/inventory/InventoryImportTab";
import { AddMedicineModal } from "@/components/inventory/AddMedicineModal";
import { UnitTable } from "@/components/units/UnitTable";

type InventoryTab = "medicines" | "imports" | "units";

const INVENTORY_TABS = [
  { id: "medicines" as InventoryTab, label: "Kho thuốc" },
  { id: "imports" as InventoryTab, label: "Quản lý nhập kho" },
  { id: "units" as InventoryTab, label: "Quản lý đơn vị tính" },
] as const;

export function Inventory() {
  const [tab, setTab] = useState<InventoryTab>("medicines");
  const [addOpen, setAddOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Cơ sở dữ liệu Thuốc
          </span>
        }
        title="Quản lý Kho Tổng"
      />

      <InventoryStats />

      <TabBar
        tabs={INVENTORY_TABS}
        activeTab={tab}
        onTabChange={(id) => setTab(id as InventoryTab)}
      />

      {tab === "medicines" && (
        <InventoryTable
          onAddClick={() => setAddOpen(true)}
          refetchTrigger={refetchTrigger}
        />
      )}
      {tab === "imports" && <InventoryImportTab />}
      {tab === "units" && <UnitTable />}

      <AddMedicineModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          setAddOpen(false);
          setRefetchTrigger((n) => n + 1);
        }}
      />
    </main>
  );
}
