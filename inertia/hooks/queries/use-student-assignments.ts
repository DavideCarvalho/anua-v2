import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.responsavel.students[':studentId'].assignments.$get

export type StudentAssignmentsResponse = InferResponseType<typeof $route>

export function useStudentAssignmentsQueryOptions(
  studentId: string,
  filters?: { status?: string; subjectId?: string }
) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'assignments', filters],
    queryFn: async () => {
      const response = await $route({
        params: { studentId },
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
  } satisfies QueryOptions
}
