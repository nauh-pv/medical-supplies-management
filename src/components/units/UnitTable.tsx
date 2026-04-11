import { useState, useEffect } from "react";
import { Modal, Input, Button, Pagination } from "@/components/common";
import {
  getUnits,
  addUnit,
  deleteUnit,
  updateUnit,
} from "@/services/inventory";
import type { UnitDoc } from "@/types/firestore";

const ITEMS_PER_PAGE = 4;

export function UnitTable() {
  const [units, setUnits] = useState<UnitDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<UnitDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUnits();
  }, []);

  async function loadUnits() {
    setLoading(true);
    try {
      const data = await getUnits();
      setUnits(data);
    } catch (err) {
      console.error("UnitTable fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = units.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.description.toLowerCase().includes(search.toLowerCase()),
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
    await addUnit(form.name.trim(), form.description.trim());
    setForm({ name: "", description: "" });
    setAddOpen(false);
    setPage(1);
    await loadUnits();
    setSaving(false);
  }

  function openEdit(unit: UnitDoc) {
    setEditUnit(unit);
    setForm({ name: unit.name, description: unit.description });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUnit || !form.name.trim()) return;
    setSaving(true);
    await updateUnit(editUnit.id, form.name.trim(), form.description.trim());
    setEditUnit(null);
    setForm({ name: "", description: "" });
    await loadUnits();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteUnit(id);
    await loadUnits();
  }

  return (
    <>
      <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden border border-outline-variant/10">
        {/* Filter bar */}
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/50">
          <div className="relative flex-1 min-w-[300px]">
            <Input
              leadingIcon="search"
              placeholder="Tìm kiếm đơn vị tính..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button icon="add" onClick={() => setAddOpen(true)}>
            Thêm đơn vị mới
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-on-surface-variant gap-3">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">
                progress_activity
              </span>
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-8 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest w-20">
                    STT
                  </th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Tên đơn vị tính
                  </th>
                  <th className="px-6 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Mô tả
                  </th>
                  <th className="px-8 py-4 font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {paged.map((unit, i) => (
                  <tr
                    key={unit.id}
                    className="hover:bg-surface-bright transition-colors group"
                  >
                    <td className="px-8 py-5 text-sm text-on-surface-variant font-medium">
                      {String((page - 1) * ITEMS_PER_PAGE + i + 1).padStart(
                        2,
                        "0",
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-on-surface">{unit.name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-on-surface-variant">
                        {unit.description || "—"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(unit)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-xl">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-xl">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        <div className="px-8 py-6 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low/20">
          <p className="text-sm text-on-surface-variant">
            Hiển thị{" "}
            <span className="font-bold text-on-surface">
              {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            của {filtered.length} đơn vị
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Add Unit Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Thêm đơn vị tính mới"
        subtitle="Thiết lập tham số đo lường kho vận"
        maxWidth="max-w-lg"
      >
        <form className="px-10 py-8 space-y-6" onSubmit={handleAdd}>
          <Input
            label="Tên đơn vị tính"
            placeholder="VD: Chai, Lọ, Viên, Vỉ, Ống"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Mô tả
            </label>
            <textarea
              rows={3}
              placeholder="Nhập ghi chú về cách sử dụng đơn vị này..."
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-on-primary bg-primary hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              Lưu đơn vị
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Unit Modal */}
      <Modal
        open={!!editUnit}
        onClose={() => setEditUnit(null)}
        title="Chỉnh sửa đơn vị tính"
        subtitle="Cập nhật tên và mô tả đơn vị tính"
        maxWidth="max-w-lg"
      >
        <form className="px-10 py-8 space-y-6" onSubmit={handleEdit}>
          <Input
            label="Tên đơn vị tính"
            placeholder="VD: Chai, Lọ, Viên, Vỉ, Ống"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Mô tả
            </label>
            <textarea
              rows={3}
              placeholder="Nhập ghi chú về cách sử dụng đơn vị này..."
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditUnit(null)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-on-primary bg-primary hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
