import { PageHeader } from "@/components/common";
import { BranchStatCards } from "@/components/branches/BranchStatCards";
import { BranchTable } from "@/components/branches/BranchTable";

export function Branches() {
  return (
    <main className="ml-72 pt-24 px-8 pb-12 space-y-8 min-h-screen bg-background">
      <PageHeader
        eyebrow={
          <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
            Quản lý hệ thống
          </span>
        }
        title="Quản lý Chi nhánh"
      />
      <BranchStatCards />
      <BranchTable />
    </main>
  );
}
