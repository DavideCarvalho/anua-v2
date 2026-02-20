import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsavel.api.studentDocuments')
export type StudentDocumentsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useStudentDocumentsQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'documents'],
    queryFn: async () => {
      const response = await tuyau
        .resolveRoute()('api.v1.responsavel.api.studentDocuments', { studentId })
        .$get()
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar documentos')
      }
      return response.data
    },
    enabled: !!studentId,
  }
}
