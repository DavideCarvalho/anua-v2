import { useQuery } from '@tanstack/react-query'
import { tuyau } from '~/lib/api'

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

export function useAuditsQueryOptions(entityType: EntityType, entityId: string) {
  return {
    queryKey: ['audits', entityType, entityId],
    queryFn: async () => {
      const response = await tuyau.api.v1.audits[entityType][entityId].$get()
      return response.data as AuditEntry[]
    },
    enabled: !!entityType && !!entityId,
  }
}

export function useAudits(entityType: EntityType, entityId: string) {
  return useQuery(useAuditsQueryOptions(entityType, entityId))
}

export function useStudentAuditHistoryQueryOptions(studentId: string) {
  return {
    queryKey: ['student-audit-history', studentId],
    queryFn: async () => {
      const response = await tuyau.api.v1.audits.students[studentId].history.$get()
      return response.data as StudentAuditEntry[]
    },
    enabled: !!studentId,
  }
}

export function useStudentAuditHistory(studentId: string) {
  return useQuery(useStudentAuditHistoryQueryOptions(studentId))
}
