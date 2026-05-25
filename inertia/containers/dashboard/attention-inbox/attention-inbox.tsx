import { useState } from 'react'
import { Sparkles } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'
import { AttentionDrawer } from './attention-drawer'
import { AttentionItem } from './attention-item'
import { AttentionInboxSkeleton } from './attention-inbox-skeleton'
import {
  useAttentionItems,
  type AttentionInboxFilters,
  type AttentionInboxScope,
} from './use_attention_items'
import type { AttentionItem as AttentionItemType, Severity } from './types'

interface AttentionInboxProps extends AttentionInboxFilters, AttentionInboxScope {
  initialVisible?: number
  increment?: number
}

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Crítico',
  warn: 'Atenção',
  info: 'Para acompanhar',
}

function InboxContent({
  initialVisible = 8,
  increment = 8,
  showFinancial,
  showEnrollment,
  ...filters
}: AttentionInboxProps) {
  const { items, isLoading, pedagogicalAlerts, overdueAging, enrollmentFunnel } = useAttentionItems(
    filters,
    { showFinancial, showEnrollment }
  )
  const [visibleCount, setVisibleCount] = useState(initialVisible)
  const [selectedItem, setSelectedItem] = useState<AttentionItemType | null>(null)

  const renderBody = () => {
    if (isLoading && items.length === 0) {
      return (
        <div className="px-4 py-3">
          <AttentionInboxSkeleton />
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Tudo em dia.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Nenhum item pede a sua atenção agora.
          </p>
        </div>
      )
    }

    const visible = items.slice(0, visibleCount)
    const hidden = items.length - visible.length

    let lastSeverity: Severity | null = null

    return (
      <div className="px-4 py-3 space-y-1">
        {visible.map((item) => {
          const severityChanged = item.severity !== lastSeverity
          lastSeverity = item.severity
          return (
            <div key={item.id}>
              {severityChanged ? (
                <div className="mt-3 mb-1 px-3 -mx-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground first:mt-0">
                  {SEVERITY_LABEL[item.severity]}
                </div>
              ) : null}
              <AttentionItem item={item} onSelect={setSelectedItem} />
            </div>
          )
        })}

        {hidden > 0 ? (
          <div className="pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setVisibleCount((c) => c + increment)}
              className="w-full justify-center text-muted-foreground hover:text-foreground"
            >
              Ver mais {Math.min(hidden, increment)} {hidden === 1 ? 'item' : 'itens'}
            </Button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium text-foreground">Insights</h2>
        </div>
        {items.length > 0 ? (
          <Badge variant="secondary" className="px-2 py-0 text-[11px] font-medium tabular-nums">
            {items.length}
          </Badge>
        ) : null}
      </div>

      <div>{renderBody()}</div>

      <AttentionDrawer
        item={selectedItem}
        pedagogicalAlerts={pedagogicalAlerts}
        overdueAging={overdueAging}
        enrollmentFunnel={enrollmentFunnel}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null)
        }}
      />
    </>
  )
}

export function AttentionInbox(props: AttentionInboxProps) {
  return (
    <DashboardCardBoundary title="Insights">
      <section
        aria-labelledby="attention-inbox-heading"
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <InboxContent {...props} />
      </section>
    </DashboardCardBoundary>
  )
}
