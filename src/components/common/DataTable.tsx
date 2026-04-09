import { type ReactNode } from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyText?: string;
  className?: string;
}

/**
 * No-line data table following the design system:
 * - No horizontal/vertical dividers
 * - Alternating row fills with surface-container-low
 * - label-md headers in on-surface-variant with surface-dim background bar
 * - Generous vertical padding
 */
export function DataTable<T>({
  columns,
  data,
  keyField,
  emptyText = "Không có dữ liệu",
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={["w-full overflow-x-auto", className].join(" ")}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-container">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={[
                  "px-4 py-3 text-left text-xs font-label font-semibold uppercase tracking-[0.05em] text-on-surface-variant first:rounded-tl-xl last:rounded-tr-xl",
                  col.className ?? "",
                ].join(" ")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-on-surface-variant"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={String(row[keyField])}
                className={
                  rowIdx % 2 === 0
                    ? "bg-surface-container-lowest"
                    : "bg-surface-container-low"
                }
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={[
                      "px-4 py-4 text-sm text-on-surface",
                      col.className ?? "",
                    ].join(" ")}
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
