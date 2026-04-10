export interface DrugRow {
  id: number;
  name: string;
  category: string;
  unit: string;
  qty: number;
  unitPrice: string;
  icon: string;
}

interface DrugOption {
  name: string;
  category: string;
  unit: string;
  unitPrice: string;
  icon: string;
}

interface DrugRequestRowProps {
  row: DrugRow;
  drugs: DrugOption[];
  onQtyChange: (id: number, val: number) => void;
  onRemove: (id: number) => void;
}

export function DrugRequestRow({
  row,
  drugs,
  onQtyChange,
  onRemove,
}: DrugRequestRowProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-5 p-4 rounded-2xl hover:bg-surface-container-low transition-colors">
      {/* Icon */}
      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary">
          {row.icon}
        </span>
      </div>

      {/* Medicine select */}
      <div className="flex-1 min-w-0">
        <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
          Tên thuốc
        </label>
        <select className="w-full bg-transparent border-none p-0 font-bold text-sm text-on-surface focus:ring-0 cursor-pointer outline-none appearance-none">
          {drugs.map((d) => (
            <option key={d.name}>{d.name}</option>
          ))}
        </select>
        <p className="text-xs text-on-surface-variant mt-0.5">{row.category}</p>
      </div>

      {/* Unit */}
      <div className="w-20 shrink-0">
        <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
          Đơn vị
        </label>
        <p className="text-sm font-medium text-on-surface">{row.unit}</p>
      </div>

      {/* Qty */}
      <div className="w-32 shrink-0">
        <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
          Số lượng
        </label>
        <input
          type="number"
          className="w-full bg-surface-container-low border-none rounded-xl text-center font-bold text-sm py-2 outline-none focus:ring-2 focus:ring-primary/20"
          value={row.qty}
          onChange={(e) => onQtyChange(row.id, parseInt(e.target.value) || 1)}
        />
      </div>

      {/* Unit price */}
      <div className="w-36 shrink-0 text-right">
        <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
          Đơn giá dự kiến
        </label>
        <p className="text-sm font-semibold text-on-surface">{row.unitPrice}</p>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        className="text-error/40 hover:text-error transition-colors shrink-0 p-1"
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  );
}
