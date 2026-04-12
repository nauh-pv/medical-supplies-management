import { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/common";
import { adminCreateBranchUser } from "@/services/auth";
import { updateBranchUser } from "@/services/user";
import type { UserDoc } from "@/types/firestore";

interface BranchFormModalProps {
  open: boolean;
  onClose: () => void;
  editBranch?: UserDoc | null;
  onSuccess: (updated?: Partial<UserDoc> & { uid: string }) => void;
}

const EMPTY_FORM = {
  displayName: "",
  email: "",
  password: "",
  phone: "",
  branchName: "",
  branchCode: "",
  branchAddress: "",
  status: "active" as "active" | "paused",
};

export function BranchFormModal({
  open,
  onClose,
  editBranch,
  onSuccess,
}: BranchFormModalProps) {
  const isEdit = !!editBranch;
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (isEdit && editBranch) {
        setForm({
          displayName: editBranch.displayName,
          email: editBranch.email,
          password: "",
          phone: editBranch.phone ?? "",
          branchName: editBranch.branchName ?? "",
          branchCode: editBranch.branchCode ?? "",
          branchAddress: editBranch.branchAddress ?? "",
          status: editBranch.status,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError(null);
    }
  }, [open, isEdit, editBranch]);

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.displayName.trim() || !form.branchName.trim()) {
      setError("Tên hiển thị và tên chi nhánh là bắt buộc.");
      return;
    }
    if (!isEdit && (!form.email.trim() || !form.password.trim())) {
      setError("Email và mật khẩu là bắt buộc khi tạo mới.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && editBranch) {
        await updateBranchUser(editBranch.uid, {
          displayName: form.displayName.trim(),
          phone: form.phone.trim(),
          branchName: form.branchName.trim(),
          branchCode: form.branchCode.trim(),
          branchAddress: form.branchAddress.trim(),
          status: form.status,
        });
        onSuccess({
          uid: editBranch.uid,
          displayName: form.displayName.trim(),
          phone: form.phone.trim(),
          branchName: form.branchName.trim(),
          branchCode: form.branchCode.trim(),
          branchAddress: form.branchAddress.trim(),
          status: form.status,
        });
      } else {
        await adminCreateBranchUser(
          form.email.trim(),
          form.password,
          form.displayName.trim(),
          form.phone.trim(),
          form.branchName.trim(),
          form.branchCode.trim(),
          form.branchAddress.trim(),
        );
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("email-already-in-use")) {
        setError("Email này đã được sử dụng.");
      } else if (msg.includes("weak-password")) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
      subtitle={
        isEdit
          ? "Cập nhật thông tin chi nhánh và tài khoản."
          : "Tạo tài khoản và thông tin cho chi nhánh mới."
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="px-10 py-8 space-y-6">
          {/* Branch info section */}
          <div>
            <p className="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-4">
              Thông tin chi nhánh
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tên chi nhánh *"
                placeholder="VD: Chi nhánh Quận 1"
                value={form.branchName}
                onChange={(e) => set("branchName", e.target.value)}
              />
              <Input
                label="Mã chi nhánh"
                placeholder="VD: CN001"
                value={form.branchCode}
                onChange={(e) => set("branchCode", e.target.value)}
              />
              <div className="md:col-span-2">
                <Input
                  label="Địa chỉ"
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                  value={form.branchAddress}
                  onChange={(e) => set("branchAddress", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Account info section */}
          <div>
            <p className="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-4">
              Tài khoản đăng nhập
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tên người phụ trách *"
                placeholder="Họ và tên"
                value={form.displayName}
                onChange={(e) => set("displayName", e.target.value)}
              />
              <Input
                label="Số điện thoại"
                placeholder="0901234567"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
              <Input
                label="Email đăng nhập *"
                type="email"
                placeholder="email@chinhanh.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                disabled={isEdit}
              />
              {!isEdit && (
                <Input
                  label="Mật khẩu *"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              )}
              {isEdit && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label font-medium text-on-surface-variant">
                    Trạng thái
                  </label>
                  <select
                    className="h-12 px-4 rounded-xl bg-surface-container text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.status}
                    onChange={(e) =>
                      set("status", e.target.value as "active" | "paused")
                    }
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="paused">Tạm dừng</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-error font-medium bg-error-container/30 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}
        </div>

        <div className="px-10 pb-8 flex gap-3 justify-end">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            icon={isEdit ? "save" : "add"}
            disabled={loading}
          >
            {loading ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo chi nhánh"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
