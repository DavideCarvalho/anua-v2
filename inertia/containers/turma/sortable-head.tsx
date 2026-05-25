import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '~/lib/utils'

export type SortDir = 'asc' | 'desc'

export interface SortState<TKey extends string> {
  by: TKey
  dir: SortDir
}

interface SortableHeadProps<TKey extends string> {
  label: string
  by: TKey
  defaultDir: SortDir
  sort: SortState<TKey>
  onChange: (next: SortState<TKey>) => void
  align?: 'start' | 'center'
}

export function SortableHead<TKey extends string>({
  label,
  by,
  defaultDir,
  sort,
  onChange,
  align = 'start',
}: SortableHeadProps<TKey>) {
  const active = sort.by === by
  const Icon = active ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  function handleClick() {
    if (active) {
      onChange({ by, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      onChange({ by, dir: defaultDir })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1 rounded text-xs font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        active ? 'text-foreground' : 'text-muted-foreground',
        align === 'center' && 'w-full justify-center'
      )}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span>{label}</span>
      <Icon
        className={cn('h-3 w-3 shrink-0 transition-opacity', active ? 'opacity-100' : 'opacity-50')}
      />
    </button>
  )
}
