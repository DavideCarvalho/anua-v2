import { queryOptions } from '@tanstack/react-query'

export interface AuditEntry {
  id: string
  event: 'created' | 'updated' | 'deleted'
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  metadata: {
    ip_address?: string
    user_agent?: string
    url?: string
    source?: string
    user_name?: string
  } | null
  createdAt: string
}

export interface StudentAuditEntry extends AuditEntry {
  entityType: string
  entityId: string
}

type EntityType = 'invoice' | 'student-payment' | 'student-has-level' | 'agreement' | 'contract'

function toAuditEntry(item: Record<string, unknown>): AuditEntry {
  const createdAt = item.createdAt
  const event = item.event

  return {
    id: String(item.id),
    event: event === 'created' || event === 'updated' || event === 'deleted' ? event : 'updated',
    oldValues: (item.oldValues as Record<string, unknown> | null) ?? null,
    newValues: (item.newValues as Record<string, unknown> | null) ?? null,
    metadata: (item.metadata as AuditEntry['metadata']) ?? null,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt ?? ''),
  }
}

export function useAuditsQueryOptions(entityType: EntityType, entityId: string) {
  return queryOptions({
    queryKey: ['audits', entityType, entityId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/audits/${entityType}/${entityId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar auditoria')
      }

      const payload = (await response.json()) as { data?: Array<Record<string, unknown>> }
      return (payload.data ?? []).map(toAuditEntry)
    },
    enabled: !!entityType && !!entityId,
  })
}

export function useStudentAuditHistoryQueryOptions(studentId: string) {
  return queryOptions({
    queryKey: ['student-audit-history', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/audits/students/${studentId}/history`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico de auditoria')
      }

      const payload = (await response.json()) as { data?: Array<Record<string, unknown>> }

      return (payload.data ?? []).map((item) => ({
        ...toAuditEntry(item),
        entityType: String(item.entityType ?? ''),
        entityId: String(item.entityId ?? ''),
      })) as StudentAuditEntry[]
    },
    enabled: !!studentId,
  })
}
