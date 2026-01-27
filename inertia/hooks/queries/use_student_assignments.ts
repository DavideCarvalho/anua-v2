import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsavel.api.studentAssignments')

export type StudentAssignmentsResponse = InferResponseType<typeof $route.$get>

export function useStudentAssignmentsQueryOptions(
  studentId: string,
  filters?: { status?: string; subjectId?: string }
) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'assignments', filters],
    queryFn: async () => {
      const response = await tuyau
        .$route('api.v1.responsavel.api.studentAssignments', { studentId })
        .$get({
          query: {
            status: filters?.status,
            subjectId: filters?.subjectId,
          },
        })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar atividades')
      }
      return response.data
    },
    enabled: !!studentId,
  } satisfies QueryOptions
}
