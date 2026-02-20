import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsavel.api.studentOverview')
export type StudentOverview = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useStudentOverviewQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'student', studentId, 'overview'],
    queryFn: async () => {
      const response = await tuyau
        .resolveRoute()('api.v1.responsavel.api.studentOverview', { studentId })
        .$get()
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar dados')
      }
      return response.data
    },
    enabled: !!studentId,
  }
}
