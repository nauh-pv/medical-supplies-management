import { useState } from "react";
import { PageHeader, Button } from "@/components/common";
import { DispatchList } from "@/components/dispatches/DispatchList";
import { CreateDispatchForm } from "@/components/dispatches/CreateDispatchForm";

type DispatchTab = "history" | "create";

export function Dispatches() {
  const [tab, setTab] = useState<DispatchTab>("history");

  const tabs: { id: DispatchTab; label: string }[] = [
    { id: "history", label: "Lịch sử xuất kho" },
    { id: "create", label: "Tạo lệnh xuất kho" },
  ];

  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Vận hành kho vận
          </span>
        }
        title="Quản lý xuất kho"
        titleSize="text-4xl"
        actions={
          tab === "history" ? (
            <>
              <Button variant="ghost" icon="download">
                Xuất báo cáo (CSV)
              </Button>
              <Button icon="add" onClick={() => setTab("create")}>
                Tạo đơn mới
              </Button>
            </>
          ) : undefined
        }
      />

      {/* Tab switcher */}
      <div className="flex bg-surface-container-low p-1 rounded-full w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "px-6 py-2 text-sm font-semibold transition-all rounded-full",
              tab === t.id
                ? "text-on-primary bg-primary shadow-md shadow-primary/20 font-bold"
                : "text-on-surface-variant hover:text-primary",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "history" && <DispatchList />}
      {tab === "create" && (
        <CreateDispatchForm onCancel={() => setTab("history")} />
      )}
    </main>
  );
}
