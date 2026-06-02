import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  Input,
  Modal,
  Pagination,
  Select,
} from "@/components/common";
import type { ServiceDoc, ServiceType } from "@/types/firestore";
import {
  addService,
  deleteService,
  getServices,
  updateService,
} from "@/services/inventory";

const ITEMS_PER_PAGE = 6;

interface ServiceForm {
  name: string;
  type: ServiceType;
  price: string;
  description: string;
}

const EMPTY_FORM: ServiceForm = {
  name: "",
  type: "injection",
  price: "",
  description: "",
};

const typeLabels: Record<ServiceType, string> = {
  injection: "Tiêm",
  consultation: "Khám / Tư vấn",
  other: "Khác",
};

export function ServiceTable() {
  const [services, setServices] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<ServiceDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<ServiceDoc | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error("ServiceTable fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = services.filter(
    (service) =>
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.code.toLowerCase().includes(search.toLowerCase()) ||
      typeLabels[service.type].toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) return;
    setSaving(true);
    try {
      await addService({
        name: form.name.trim(),
        type: form.type,
        price: Number(form.price),
        description: form.description.trim(),
      });
      setForm(EMPTY_FORM);
      setAddOpen(false);
      setPage(1);
      await loadServices();
    } finally {
      setSaving(false);
    }
  }

  function openEdit(service: ServiceDoc) {
    setEditService(service);
    setForm({
      name: service.name,
      type: service.type,
      price: String(service.price),
      description: service.description,
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editService || !form.name.trim() || !form.price.trim()) return;
    setSaving(true);
    try {
      await updateService(editService.id, {
        name: form.name.trim(),
        type: form.type,
        price: Number(form.price),
        description: form.description.trim(),
      });
      setEditService(null);
      setForm(EMPTY_FORM);
      await loadServices();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      setDeleteTarget(null);
      await loadServices();
    } finally {
      setDeleting(false);
    }
  }

  const formFields = (
    <>
      <Input
        label="Tên dịch vụ"
        placeholder="VD: Tiêm vitamin, Tiêm vaccine"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Loại dịch vụ"
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as ServiceType }))
          }
        >
          <option value="injection">Tiêm</option>
          <option value="consultation">Khám / Tư vấn</option>
          <option value="other">Khác</option>
        </Select>
        <Input
          label="Giá dịch vụ"
          type="number"
          min="0"
          placeholder="VD: 150000"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
          Mô tả
        </label>
        <textarea
          rows={3}
          placeholder="Nhập mô tả ngắn cho dịch vụ..."
          className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>
    </>
  );

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden border border-outline-variant/10">
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
          <div className="relative flex-1 min-w-[300px]">
            <Input
              size="lg"
              leadingIcon="search"
              placeholder="Tìm kiếm dịch vụ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button size="lg" icon="add" onClick={() => setAddOpen(true)}>
            Thêm dịch vụ mới
          </Button>
        </div>

        <DataTable
          columns={[
            {
              key: "code",
              header: "Mã dịch vụ",
              render: (service) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                  {service.code}
                </span>
              ),
            },
            {
              key: "name",
              header: "Tên dịch vụ",
              render: (service) => (
                <div>
                  <p className="font-bold text-on-surface">{service.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {service.description || "—"}
                  </p>
                </div>
              ),
            },
            {
              key: "type",
              header: "Loại",
              render: (service) => (
                <Badge variant="info">{typeLabels[service.type]}</Badge>
              ),
            },
            {
              key: "price",
              header: "Giá",
              headerClassName: "text-right",
              className: "text-right font-mono font-bold",
              render: (service) => `${service.price.toLocaleString("vi-VN")}đ`,
            },
            {
              key: "isActive",
              header: "Trạng thái",
              render: () => (
                <Badge variant="success" dot>
                  Đang hoạt động
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Thao tác",
              headerClassName: "text-center",
              className: "text-center",
              render: (service) => (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEdit(service)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <span className="material-symbols-outlined text-xl">
                      edit
                    </span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(service)}
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
          emptyText="Chưa có dịch vụ nào"
        />

        <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
          <p className="text-sm text-on-surface-variant">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            của {filtered.length} dịch vụ
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setForm(EMPTY_FORM);
        }}
        title="Thêm dịch vụ mới"
        subtitle="Tạo dịch vụ tiêm, khám hoặc dịch vụ khác"
        maxWidth="max-w-lg"
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
              {saving ? "Đang lưu..." : "Lưu dịch vụ"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editService}
        onClose={() => {
          setEditService(null);
          setForm(EMPTY_FORM);
        }}
        title="Chỉnh sửa dịch vụ"
        subtitle="Cập nhật thông tin dịch vụ"
        maxWidth="max-w-lg"
      >
        <form className="px-10 py-8 space-y-6" onSubmit={handleEdit}>
          {formFields}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setEditService(null);
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

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xóa dịch vụ"
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
              Bạn có chắc chắn muốn xóa{" "}
              <span className="font-bold text-on-surface">
                {deleteTarget?.name}
              </span>
              ?
            </p>
          </div>
          <div className="flex gap-3">
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
              {deleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
