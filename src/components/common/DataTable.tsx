import { type ReactNode } from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  /** Extra classes applied to the <th> header cell only */
  headerClassName?: string;
  /** Extra classes applied to every <td> data cell in this column */
  className?: string;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** If omitted, row index is used as the React key */
  keyField?: keyof T;
  emptyText?: string;
  /** Applied to the outer wrapper <div> */
  className?: string;
  /** Show skeleton rows while loading */
  loading?: boolean;
  /** Number of skeleton rows (default 5) */
  loadingRows?: number;
  /** Prepend an auto-numbered STT column */
  showIndex?: boolean;
  /** Base offset for STT (default 0 → first row = 01) */
  indexOffset?: number;
  /** Class applied to the <tr> in <thead> (default bg-surface-container-low) */
  headerRowClassName?: string;
  /** Per-row className override; overrides the default alternating pattern */
  rowClassName?: (row: T, index: number) => string;
  /** Rendered as the last child of <tbody> — use for totals rows etc. */
  footer?: ReactNode;
  /** Class on the <table> element (default "w-full border-collapse") */
  tableClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  emptyText = "Không có dữ liệu",
  className = "",
  loading = false,
  loadingRows = 5,
  showIndex = false,
  indexOffset = 0,
  headerRowClassName = "bg-surface-container-low",
  rowClassName,
  footer,
  tableClassName = "w-full border-collapse",
}: DataTableProps<T>) {
  const totalCols = columns.length + (showIndex ? 1 : 0);
  const defaultRowCls = (idx: number) =>
    [
      "group hover:bg-surface-bright transition-colors",
      idx % 2 === 0
        ? "bg-surface-container-lowest"
        : "bg-surface-container-low/30",
    ].join(" ");

  return (
    <div className={["w-full overflow-x-auto", className].join(" ")}>
      <table className={tableClassName}>
        <thead>
          <tr className={headerRowClassName}>
            {showIndex && (
              <th className="px-8 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest w-16">
                STT
              </th>
            )}
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={[
                  "px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest",
                  col.headerClassName ?? "",
                ].join(" ")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={i}>
                <td colSpan={totalCols} className="px-6 py-4">
                  <div className="h-8 bg-surface-container-low rounded-xl animate-pulse" />
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={totalCols}
                className="px-6 py-12 text-center text-sm text-on-surface-variant"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
              const key = keyField ? String(row[keyField]) : String(rowIdx);
              const rowCls = rowClassName
                ? rowClassName(row, rowIdx)
                : defaultRowCls(rowIdx);
              return (
                <tr key={key} className={rowCls}>
                  {showIndex && (
                    <td className="px-8 py-4 text-sm text-on-surface-variant font-medium">
                      {String(indexOffset + rowIdx + 1).padStart(2, "0")}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={[
                        "px-6 py-4 text-sm text-on-surface",
                        col.className ?? "",
                      ].join(" ")}
                    >
                      {col.render
                        ? col.render(row, rowIdx)
                        : String(row[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
          {footer}
        </tbody>
      </table>
    </div>
  );
}
