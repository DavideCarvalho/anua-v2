import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsavel.api.studentOccurrences')

export type StudentOccurrencesResponse = InferResponseType<typeof $route.$get>

export function useStudentOccurrencesQueryOptions(
  studentId: string,
  filters?: { type?: string; status?: string; severity?: string }
) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'occurrences', filters],
    queryFn: async () => {
      const response = await tuyau
        .$route('api.v1.responsavel.api.studentOccurrences', { studentId })
        .$get({
          query: {
            type: filters?.type,
            status: filters?.status,
            severity: filters?.severity,
          },
        })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar ocorrencias')
      }
      return response.data
    },
    enabled: !!studentId,
  } satisfies QueryOptions
}
