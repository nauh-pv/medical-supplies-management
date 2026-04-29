import { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  Pagination,
  Badge,
  DataTable,
} from "@/components/common";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/inventory";
import type { SupplierDoc } from "@/types/firestore";

const ITEMS_PER_PAGE = 6;

interface SupplierForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const EMPTY_FORM: SupplierForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

export function SupplierTable() {
  const [suppliers, setSuppliers] = useState<SupplierDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<SupplierDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<SupplierDoc | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error("SupplierTable fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await addSupplier({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      });
      setForm(EMPTY_FORM);
      setAddOpen(false);
      setPage(1);
      await loadSuppliers();
    } finally {
      setSaving(false);
    }
  }

  function openEdit(supplier: SupplierDoc) {
    setEditSupplier(supplier);
    setForm({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editSupplier || !form.name.trim()) return;
    setSaving(true);
    try {
      await updateSupplier(editSupplier.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      });
      setEditSupplier(null);
      setForm(EMPTY_FORM);
      await loadSuppliers();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSupplier(deleteTarget.id);
      setDeleteTarget(null);
      await loadSuppliers();
    } finally {
      setDeleting(false);
    }
  }

  const formFields = (
    <>
      <Input
        label="Tên nhà cung cấp"
        placeholder="VD: Công ty Dược phẩm ABC"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Số điện thoại"
          placeholder="VD: 0901234567"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          placeholder="VD: lienhe@abc.vn"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
          Địa chỉ
        </label>
        <textarea
          rows={2}
          placeholder="Nhập địa chỉ nhà cung cấp..."
          className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>
    </>
  );

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden border border-outline-variant/10">
        {/* Filter bar */}
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
          <div className="relative flex-1 min-w-[300px]">
            <Input
              leadingIcon="search"
              placeholder="Tìm kiếm nhà cung cấp..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button icon="add" onClick={() => setAddOpen(true)}>
            Thêm NCC mới
          </Button>
        </div>

        {/* Table */}
        <DataTable
          columns={[
            {
              key: "code",
              header: "Mã NCC",
              render: (supplier) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                  {supplier.code}
                </span>
              ),
            },
            {
              key: "name",
              header: "Tên nhà cung cấp",
              render: (supplier) => (
                <p className="font-bold text-on-surface">{supplier.name}</p>
              ),
            },
            {
              key: "phone",
              header: "Liên hệ",
              render: (supplier) => (
                <div className="space-y-1">
                  {supplier.phone && (
                    <p className="text-sm text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        phone
                      </span>
                      {supplier.phone}
                    </p>
                  )}
                  {supplier.email && (
                    <p className="text-sm text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">
                        mail
                      </span>
                      {supplier.email}
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: "address",
              header: "Địa chỉ",
              render: (supplier) => (
                <p className="text-sm text-on-surface-variant max-w-[200px] truncate">
                  {supplier.address || "—"}
                </p>
              ),
            },
            {
              key: "isActive",
              header: "Trạng thái",
              render: () => (
                <Badge variant="success" dot>
                  Đang hợp tác
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Thao tác",
              headerClassName: "text-center",
              className: "text-center",
              render: (supplier) => (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEdit(supplier)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <span className="material-symbols-outlined text-xl">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(supplier)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <span className="material-symbols-outlined text-xl">
                      delete
                    </span>
                  </button>
                </div>
              ),
            },
          ]}
          data={paged}
          keyField="id"
          loading={loading}
          loadingRows={ITEMS_PER_PAGE}
          showIndex
          indexOffset={(page - 1) * ITEMS_PER_PAGE}
          headerRowClassName="bg-surface-container-low border-b border-outline-variant/10"
          rowClassName={() => "hover:bg-surface-bright transition-colors group"}
          emptyText="Chưa có nhà cung cấp nào"
        />

        {/* Pagination footer */}
        <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
          <p className="text-sm text-on-surface-variant">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            của {filtered.length} nhà cung cấp
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setForm(EMPTY_FORM);
        }}
        title="Thêm nhà cung cấp mới"
        subtitle="Đăng ký nhà cung cấp dược phẩm vào hệ thống"
        maxWidth="max-w-2xl"
      >
        <form className="px-10 py-8 space-y-6" onSubmit={handleAdd}>
          {formFields}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setAddOpen(false);
                setForm(EMPTY_FORM);
              }}
              className="flex-1 justify-center"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 justify-center"
            >
              {saving ? "Đang lưu..." : "Lưu nhà cung cấp"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal
        open={!!editSupplier}
        onClose={() => {
          setEditSupplier(null);
          setForm(EMPTY_FORM);
        }}
        title="Chỉnh sửa nhà cung cấp"
        subtitle="Cập nhật thông tin nhà cung cấp"
        maxWidth="max-w-2xl"
      >
        <form className="px-10 py-8 space-y-6" onSubmit={handleEdit}>
          {formFields}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setEditSupplier(null);
                setForm(EMPTY_FORM);
              }}
              className="flex-1 justify-center"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 justify-center"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xóa nhà cung cấp"
        maxWidth="max-w-md"
      >
        <div className="px-10 py-8 space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-error-container/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-error">
                delete_forever
              </span>
            </div>
            <p className="text-sm text-on-surface-variant">
              Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
              <span className="font-bold text-on-surface">
                {deleteTarget?.name}
              </span>{" "}
              ({deleteTarget?.code}) không? Hành động này không thể hoàn tác.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 justify-center"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 justify-center"
            >
              {deleting ? "Đang xóa..." : "Xóa nhà cung cấp"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
