import { useState } from "react";
import { PageHeader, TabBar } from "@/components/common";
import { DispatchList } from "@/components/dispatches/DispatchList";
import { CreateDispatchForm } from "@/components/dispatches/CreateDispatchForm";

type DispatchTab = "history" | "create";

const DISPATCH_TABS = [
  { id: "history" as DispatchTab, label: "Lịch sử xuất kho" },
  { id: "create" as DispatchTab, label: "Tạo lệnh xuất kho" },
] as const;

export function Dispatches() {
  const [tab, setTab] = useState<DispatchTab>("history");

  return (
    <main className="md:ml-72 pt-24 px-4 md:px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Vận hành kho vận
          </span>
        }
        title="Quản lý xuất kho"
        actions={
          <TabBar
            tabs={DISPATCH_TABS}
            activeTab={tab}
            onTabChange={(id) => setTab(id as DispatchTab)}
            variant="pill"
          />
        }
      />

      {tab === "history" && <DispatchList />}
      {tab === "create" && (
        <CreateDispatchForm onCancel={() => setTab("history")} />
      )}
    </main>
  );
}
