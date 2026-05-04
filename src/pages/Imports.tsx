import { useState } from "react";
import { PageHeader, TabBar } from "@/components/common";
import { ImportList } from "@/components/imports/ImportList";
import { CreateRequestForm } from "@/components/imports/CreateRequestForm";

type ImportsTab = "create" | "manage";

const IMPORTS_TABS = [
  { id: "create" as ImportsTab, label: "Tạo yêu cầu" },
  { id: "manage" as ImportsTab, label: "Quản lý nhập thuốc" },
] as const;

export function Imports() {
  const [tab, setTab] = useState<ImportsTab>("create");

  return (
    <main className="md:ml-72 pt-24 px-4 md:px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Cung ứng dược phẩm
          </span>
        }
        title="Yêu cầu nhập thuốc"
        subtitle="Quản lý và tạo mới các đơn hàng cung ứng dược phẩm cho chi nhánh."
      />

      <TabBar
        tabs={IMPORTS_TABS}
        activeTab={tab}
        onTabChange={(id) => setTab(id as ImportsTab)}
      />

      {tab === "create" && <CreateRequestForm />}
      {tab === "manage" && <ImportList />}
    </main>
  );
}
