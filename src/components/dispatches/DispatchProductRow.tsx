export interface ProductRow {
  id: number;
  name: string;
  sku: string;
  lot: string;
  stock: number;
  unit: string;
  qty: number;
}

interface DispatchProductRowProps {
  row: ProductRow;
  index: number;
  onQtyChange: (id: number, delta: number) => void;
  onQtyInput: (id: number, val: number) => void;
  onRemove: (id: number) => void;
}

export function DispatchProductRow({
  row,
  index,
  onQtyChange,
  onQtyInput,
  onRemove,
}: DispatchProductRowProps) {
  return (
    <div
      className={[
        "grid grid-cols-12 px-6 py-4 items-center group",
        index % 2 === 0
          ? "bg-surface-container-lowest border-b border-surface-container/50"
          : "bg-surface-container-low/30",
      ].join(" ")}
    >
      {/* Name + SKU */}
      <div className="col-span-6">
        <button
          type="button"
          className="w-full text-left flex items-center justify-between px-4 py-2 bg-surface-container-high/30 hover:bg-surface-container-high/60 rounded-xl transition-all border border-transparent"
        >
          <div className="flex flex-col">
            <span className="font-bold text-sm text-on-surface">
              {row.name}
            </span>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium mt-0.5">
              SKU: {row.sku} | Lô: {row.lot}
            </span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-sm group-hover:text-primary transition-colors flex-shrink-0">
            expand_more
          </span>
        </button>
      </div>

      {/* Stock */}
      <div className="col-span-2 text-center text-sm font-semibold text-on-surface-variant">
        {row.stock.toLocaleString()}{" "}
        <span className="text-[10px] font-normal">{row.unit}</span>
      </div>

      {/* Qty stepper */}
      <div className="col-span-3 flex justify-center">
        <div className="flex items-center bg-surface-container rounded-full px-2 py-1">
          <button
            onClick={() => onQtyChange(row.id, -1)}
            type="button"
            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container-lowest rounded-full transition-all"
          >
            -
          </button>
          <input
            type="number"
            className="w-16 bg-transparent border-none text-center font-bold text-sm focus:ring-0 outline-none"
            value={row.qty}
            onChange={(e) =>
              onQtyInput(row.id, Math.max(1, parseInt(e.target.value) || 1))
            }
          />
          <button
            onClick={() => onQtyChange(row.id, 1)}
            type="button"
            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container-lowest rounded-full transition-all"
          >
            +
          </button>
        </div>
      </div>

      {/* Delete */}
      <div className="col-span-1 flex justify-end">
        <button
          onClick={() => onRemove(row.id)}
          type="button"
          className="p-2 text-on-surface-variant/30 hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}
