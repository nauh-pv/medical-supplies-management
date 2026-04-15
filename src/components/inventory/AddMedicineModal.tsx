import { useState, useEffect, useRef } from "react";
import { Modal, Button } from "@/components/common";
import {
  addMedicine,
  getUnits,
  updateMedicine,
  uploadMedicineImage,
} from "@/services/inventory";
import type { UnitDoc, MedicineDoc } from "@/types/firestore";

interface AddMedicineModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  medicine?: MedicineDoc | null;
}

const MAX_BLOB_SIZE = 750_000; // ~750KB blob → ~1MB base64, safe for Firestore 1MB doc limit

async function compressImage(
  file: File,
  maxPx = 800,
  quality = 0.8,
): Promise<Blob> {
  const img = await loadImage(file);
  let { width, height } = img;
  if (width > maxPx || height > maxPx) {
    if (width > height) {
      height = Math.round((height * maxPx) / width);
      width = maxPx;
    } else {
      width = Math.round((width * maxPx) / height);
      height = maxPx;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

  // Iteratively reduce quality until blob is under limit
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > MAX_BLOB_SIZE && quality > 0.1) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }
  // If still too large, reduce resolution further
  if (blob.size > MAX_BLOB_SIZE) {
    const scale = Math.sqrt(MAX_BLOB_SIZE / blob.size);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, 0.6);
  }
  return blob;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("compress failed"))),
      "image/jpeg",
      quality,
    );
  });
}

export function AddMedicineModal({
  open,
  onClose,
  onSuccess,
  medicine,
}: AddMedicineModalProps) {
  const isEdit = !!medicine;
  const [units, setUnits] = useState<UnitDoc[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "" as "" | "prescribed" | "otc",
    unitId: "",
    importPrice: "",
    sellPrice: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      getUnits().then(setUnits);
      if (medicine) {
        setForm({
          name: medicine.name,
          description: medicine.description,
          category: medicine.category,
          unitId: medicine.unitId,
          importPrice: "",
          sellPrice: "",
        });
        setImagePreview(medicine.imageUrl ?? null);
      } else {
        setForm({
          name: "",
          description: "",
          category: "",
          unitId: "",
          importPrice: "",
          sellPrice: "",
        });
        setImagePreview(null);
      }
      setImageFile(null);
      setError("");
    }
  }, [open, medicine]);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh.");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setError("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.category || !form.unitId) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    const selectedUnit = units.find((u) => u.id === form.unitId);
    if (!selectedUnit) {
      setError("Đơn vị tính không hợp lệ.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (isEdit && medicine) {
        let imageUrl = medicine.imageUrl ?? null;
        if (imageFile) {
          const compressed = await compressImage(imageFile);
          imageUrl = await uploadMedicineImage(medicine.id, compressed);
        }
        await updateMedicine(medicine.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category as "prescribed" | "otc",
          unitId: selectedUnit.id,
          unitName: selectedUnit.name,
          imageUrl,
        });
      } else {
        // Create medicine first (gets auto-generated ID), then upload image
        const id = await addMedicine({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category as "prescribed" | "otc",
          unitId: selectedUnit.id,
          unitName: selectedUnit.name,
          imageUrl: null,
          importPrice: form.importPrice
            ? Math.round(parseFloat(form.importPrice.replace(/[^\d.]/g, "")))
            : 0,
          sellPrice: form.sellPrice
            ? Math.round(parseFloat(form.sellPrice.replace(/[^\d.]/g, "")))
            : 0,
        });
        if (imageFile) {
          const compressed = await compressImage(imageFile);
          const imageUrl = await uploadMedicineImage(id, compressed);
          await updateMedicine(id, { imageUrl });
        }
      }
      onSuccess?.();
    } catch (err) {
      console.error("AddMedicineModal submit error:", err);
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}
      subtitle={
        isEdit
          ? "Cập nhật thông tin dược phẩm trong hệ thống."
          : "Đăng ký dược phẩm mới vào cơ sở dữ liệu hệ thống."
      }
      maxWidth="max-w-xl"
    >
      <form className="px-8 py-6 space-y-5" onSubmit={handleSubmit}>
        {/* Tên thuốc */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
            Tên thuốc / vật tư <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="Nhập tên thuốc hoặc vật tư y tế..."
            className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        {/* Danh mục + Đơn vị */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Danh mục <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as "prescribed" | "otc",
                  }))
                }
                required
              >
                <option value="">Chọn danh mục</option>
                <option value="prescribed">Kê đơn</option>
                <option value="otc">Không kê đơn (OTC)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xl">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
              Đơn vị tính <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                value={form.unitId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unitId: e.target.value }))
                }
                required
              >
                <option value="">Chọn đơn vị</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xl">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Mô tả */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
            Mô tả
          </label>
          <textarea
            rows={2}
            placeholder="Mô tả ngắn về thuốc / vật tư này..."
            className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>

        {/* Prices — create mode only */}
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                Giá nhập (đ/đơn vị)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm select-none">
                  ₫
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  className="w-full bg-surface-container-high border-none rounded-xl py-3 pl-9 pr-4 text-sm text-on-surface font-mono outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  value={form.importPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, importPrice: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                Giá bán (đ/đơn vị)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm select-none">
                  ₫
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  className="w-full bg-surface-container-high border-none rounded-xl py-3 pl-9 pr-4 text-sm text-on-surface font-mono outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  value={form.sellPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sellPrice: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Image upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-label font-bold uppercase tracking-[0.05em] text-on-surface-variant">
            Ảnh sản phẩm
          </label>
          <div
            className={[
              "relative rounded-xl border-2 border-dashed transition-colors cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-outline-variant/40 hover:border-primary/50",
            ].join(" ")}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="flex items-center gap-4 p-4">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {imageFile ? imageFile.name : "Ảnh hiện tại"}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {imageFile
                      ? `${(imageFile.size / 1024).toFixed(0)} KB · Sẽ được nén trước khi lưu`
                      : "Click để thay đổi ảnh"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview(medicine?.imageUrl ?? null);
                  }}
                  className="p-1.5 text-on-surface-variant hover:text-error rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">
                  add_photo_alternate
                </span>
                <p className="text-sm text-on-surface-variant">
                  Kéo thả hoặc{" "}
                  <span className="text-primary font-semibold">chọn file</span>
                </p>
                <p className="text-xs text-on-surface-variant/60">
                  JPG, PNG, WEBP · Ảnh lớn sẽ tự động nén xuống 800px
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = "";
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-error bg-error-container/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            className="flex-1 justify-center"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            icon={saving ? "progress_activity" : "save"}
            className="flex-1 justify-center"
            disabled={saving}
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm thuốc"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
