import { ArrowRight } from 'lucide-react'

import { cn } from '~/lib/utils'
import type { AttentionItem as AttentionItemType, Severity } from './types'

interface AttentionItemProps {
  item: AttentionItemType
  onSelect: (item: AttentionItemType) => void
}

const dotClass: Record<Severity, string> = {
  critical: 'bg-destructive',
  warn: 'bg-destructive/60',
  info: 'bg-muted-foreground/50',
}

const ringClass: Record<Severity, string> = {
  critical: 'ring-destructive/30',
  warn: 'ring-destructive/15',
  info: 'ring-transparent',
}

export function AttentionItem({ item, onSelect }: AttentionItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        'group flex w-full items-start gap-3 rounded-lg px-3 py-3 -mx-3 text-left',
        'transition-colors duration-150 cursor-pointer',
        'hover:bg-muted/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full ring-3',
          dotClass[item.severity],
          ringClass[item.severity]
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">{item.title}</p>
        {item.subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.subtitle}</p>
        ) : null}
      </div>

      <span
        className={cn(
          'flex shrink-0 items-center gap-1 self-center text-xs font-medium text-primary',
          'opacity-70 transition-opacity group-hover:opacity-100'
        )}
      >
        {item.action}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  )
}
