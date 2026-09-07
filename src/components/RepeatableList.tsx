import type { ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RepeatableListProps {
  ids: string[]
  onAdd: () => void
  onRemove: (index: number) => void
  renderItem: (index: number) => ReactNode
  addLabel?: string
  emptyHint?: string
}

/** Simple add/remove list for one-field-per-row sections (next week's tasks, blockers, achievements). */
export function RepeatableList({ ids, onAdd, onRemove, renderItem, addLabel = 'Add item', emptyHint }: RepeatableListProps) {
  return (
    <div className="space-y-2">
      {ids.length === 0 && emptyHint && <p className="text-sm text-slate-400">{emptyHint}</p>}
      {ids.map((id, index) => (
        <div key={id} className="flex items-start gap-2">
          <div className="flex-1">{renderItem(index)}</div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mt-1 shrink-0 rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  )
}
