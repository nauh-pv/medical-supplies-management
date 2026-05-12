import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, DataTable } from "@/components/common";
import { BranchFormModal } from "./BranchFormModal";
import type { UserDoc } from "@/types/firestore";

const PAGE_SIZE = 10;

interface BranchTableProps {
  branches: UserDoc[];
  loading: boolean;
  onRefresh: () => void;
}

export function BranchTable({
  branches,
  loading,
  onRefresh,
}: BranchTableProps) {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserDoc | null>(null);
  const navigate = useNavigate();

  function openAdd() {
    setEditTarget(null);
    setModalOpen(true);
  }
  function openEdit(branch: UserDoc) {
    setEditTarget(branch);
    setModalOpen(true);
  }
  function handleSuccess() {
    setModalOpen(false);
    onRefresh();
  }

  const totalPages = Math.max(1, Math.ceil(branches.length / PAGE_SIZE));
  const paginated = branches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div>
        {/* Action bar */}
        <div className="flex flex-wrap gap-4 justify-between items-end mb-6">
          <div className="space-y-1">
            <h3 className="font-headline text-lg font-bold text-on-surface">
              Danh sách cơ sở
            </h3>
            <p className="text-sm text-on-surface-variant">
              Quản lý và cập nhật thông tin mạng lưới y tế.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-headline font-bold text-sm flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-all shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            Thêm chi nhánh mới
          </button>
        </div>

        {/* Table card */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <DataTable
            columns={[
              {
                key: "branchName",
                header: "Tên chi nhánh",
                render: (branch) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                      <span className="material-symbols-outlined">
                        {branch.status === "active"
                          ? "local_hospital"
                          : "domain_disabled"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        {branch.branchName ?? branch.displayName}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        Mã: {branch.branchCode ?? "—"}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "branchAddress",
                header: "Địa chỉ",
                render: (branch) => (
                  <span className="text-sm text-on-surface-variant">
                    {branch.branchAddress ?? "—"}
                  </span>
                ),
              },
              {
                key: "displayName",
                header: "Tài khoản",
                render: (branch) => (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-container-high" />
                    <div>
                      <p className="text-sm text-on-surface">
                        {branch.displayName}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        {branch.email}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "phone",
                header: "Số điện thoại",
                render: (branch) => (
                  <span className="text-sm text-on-surface-variant">
                    {branch.phone}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Trạng thái",
                render: (branch) =>
                  branch.status === "active" ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant">
                      Tạm dừng
                    </span>
                  ),
              },
              {
                key: "actions",
                header: "Hành động",
                headerClassName: "text-right",
                className: "text-right",
                render: (branch) => (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/settlement?branchId=${branch.branchId ?? branch.uid}`,
                        )
                      }
                      className="p-2 hover:bg-green-50 rounded-lg text-emerald-600 transition-colors"
                      title="Quyết toán"
                    >
                      <span className="material-symbols-outlined text-lg">
                        receipt_long
                      </span>
                    </button>
                    <button
                      onClick={() => openEdit(branch)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        edit
                      </span>
                    </button>
                  </div>
                ),
              },
            ]}
            data={paginated}
            keyField="uid"
            loading={loading}
            loadingRows={4}
            showIndex
            indexOffset={(page - 1) * PAGE_SIZE}
            headerRowClassName="bg-surface-dim/30"
            rowClassName={(_, i) =>
              [
                "hover:bg-surface-container-lowest transition-colors",
                i % 2 !== 0 ? "bg-surface-container-lowest/40" : "",
              ].join(" ")
            }
            emptyText="Chưa có chi nhánh nào"
          />

          {/* Pagination footer */}
          <div className="px-6 py-4 bg-surface-dim/10 flex justify-between items-center text-xs text-on-surface-variant font-medium">
            <span>
              Hiển thị{" "}
              <span className="font-bold text-on-surface">
                {branches.length === 0
                  ? "0"
                  : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, branches.length)}`}
              </span>{" "}
              trong số {branches.length} chi nhánh
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <BranchFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editBranch={editTarget}
        onSuccess={handleSuccess}
      />
    </>
  );
}
