import type { ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EditableTableColumn {
  key: string
  label: string
  render: (index: number) => ReactNode
  className?: string
}

interface EditableTableProps {
  columns: EditableTableColumn[]
  rowCount: number
  onAddRow: () => void
  onRemoveRow: (index: number) => void
  addLabel?: string
  minRows?: number
}

/** Dynamic-row table for form sections (e.g. per-task rows) — rows are index-driven so
 * callers wire cells to react-hook-form's `tasks.${index}.field` paths. */
export function EditableTable({
  columns,
  rowCount,
  onAddRow,
  onRemoveRow,
  addLabel = 'Add row',
  minRows = 0,
}: EditableTableProps) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500',
                    c.className,
                  )}
                >
                  {c.label}
                </th>
              ))}
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {Array.from({ length: rowCount }).map((_, index) => (
              <tr key={index}>
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2 align-top">
                    {c.render(index)}
                  </td>
                ))}
                <td className="px-2 py-2 text-right align-top">
                  <button
                    type="button"
                    onClick={() => onRemoveRow(index)}
                    disabled={rowCount <= minRows}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAddRow}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  )
}
