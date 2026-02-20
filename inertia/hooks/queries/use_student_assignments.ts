import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsavel.api.studentAssignments')
export type StudentAssignmentsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useStudentAssignmentsQueryOptions(
  studentId: string,
  filters?: { status?: string; subjectId?: string }
) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'assignments', filters],
    queryFn: async () => {
      const response = await tuyau
        .resolveRoute()('api.v1.responsavel.api.studentAssignments', { studentId })
        .$get({
          query: {
            status: filters?.status,
            subjectId: filters?.subjectId,
          },
        })
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar atividades')
      }
      return response.data
    },
    enabled: !!studentId,
  }
}
