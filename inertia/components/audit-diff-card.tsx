import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileEdit, Plus, Trash2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
  getFieldLabel,
  getSourceLabel,
  getEventLabel,
  formatAuditValue,
} from '~/lib/audit_labels'
import type { AuditEntry } from '~/hooks/queries/use_audits'

interface AuditDiffCardProps {
  audit: AuditEntry
  entityType: string
}

const EVENT_ICONS = {
  created: Plus,
  updated: FileEdit,
  deleted: Trash2,
}

const EVENT_COLORS = {
  created: 'bg-green-100 text-green-800',
  updated: 'bg-blue-100 text-blue-800',
  deleted: 'bg-red-100 text-red-800',
}

export function AuditDiffCard({ audit, entityType }: AuditDiffCardProps) {
  const Icon = EVENT_ICONS[audit.event] ?? FileEdit
  const colorClass = EVENT_COLORS[audit.event] ?? EVENT_COLORS.updated

  const userName = audit.metadata?.user_name ?? 'Sistema'
  const source = getSourceLabel(audit.metadata?.source)

  // Get changed fields
  const changedFields = getChangedFields(audit, entityType)

  return (
    <Card className="border-l-4 border-l-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={colorClass}>
              <Icon className="mr-1 h-3 w-3" />
              {getEventLabel(audit.event)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(audit.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Por: <span className="font-medium text-foreground">{userName}</span>
          {source !== 'Sistema' && (
            <span className="text-muted-foreground"> via {source}</span>
          )}
        </p>
      </CardHeader>

      {changedFields.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-1">
            {changedFields.map((change) => (
              <div
                key={change.field}
                className="flex items-center gap-2 text-sm py-1 border-b border-border/50 last:border-0"
              >
                <span className="font-medium min-w-[120px] text-muted-foreground">
                  {change.label}
                </span>
                {audit.event === 'created' ? (
                  <span className="text-green-600">{change.newValue}</span>
                ) : audit.event === 'deleted' ? (
                  <span className="text-red-600 line-through">{change.oldValue}</span>
                ) : (
                  <>
                    <span className="text-muted-foreground">{change.oldValue}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground font-medium">{change.newValue}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

interface FieldChange {
  field: string
  label: string
  oldValue: string
  newValue: string
}

function getChangedFields(audit: AuditEntry, entityType: string): FieldChange[] {
  const changes: FieldChange[] = []
  const oldValues = audit.oldValues ?? {}
  const newValues = audit.newValues ?? {}

  // Get all unique fields
  const allFields = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])

  // Filter out metadata fields we don't want to show
  const ignoredFields = ['id', 'createdAt', 'updatedAt', 'deletedAt']

  for (const field of allFields) {
    if (ignoredFields.includes(field)) continue

    const oldVal = oldValues[field]
    const newVal = newValues[field]

    // Skip if values are the same
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue

    changes.push({
      field,
      label: getFieldLabel(entityType, field),
      oldValue: formatAuditValue(field, oldVal, entityType),
      newValue: formatAuditValue(field, newVal, entityType),
    })
  }

  return changes
}
