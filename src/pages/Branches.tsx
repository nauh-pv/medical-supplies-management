import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common";
import { BranchStatCards } from "@/components/branches/BranchStatCards";
import { BranchTable } from "@/components/branches/BranchTable";
import { getBranches } from "@/services/inventory";
import type { UserDoc } from "@/types/firestore";

export function Branches() {
  const [branches, setBranches] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);

  function loadBranches() {
    setLoading(true);
    getBranches()
      .then(setBranches)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBranches();
  }, []);

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
      <BranchStatCards branches={branches} loading={loading} />
      <BranchTable
        branches={branches}
        loading={loading}
        onRefresh={loadBranches}
      />
    </main>
  );
}
