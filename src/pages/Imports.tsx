import { useState } from "react";
import { PageHeader, Button } from "@/components/common";
import { ImportUploadZone } from "@/components/imports/ImportUploadZone";
import { ImportList } from "@/components/imports/ImportList";
import { CreateImportModal } from "@/components/imports/CreateImportModal";

export function Imports() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <main className="ml-72 pt-24 px-8 pb-12 min-h-screen bg-background">
      <PageHeader
        title="Quản lý Nhập kho"
        actions={
          <>
            <Button variant="ghost" icon="file_upload">
              Nhập từ file Excel
            </Button>
            <Button icon="add_circle" onClick={() => setCreateOpen(true)}>
              Nhập hàng thủ công
            </Button>
          </>
        }
      />

      <div className="mt-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <ImportUploadZone />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <ImportList />
        </div>
      </div>

      <CreateImportModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </main>
  );
}
