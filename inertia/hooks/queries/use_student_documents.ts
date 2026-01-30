import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsavel.api.studentDocuments')

export type StudentDocumentsResponse = InferResponseType<typeof $route.$get>

export function useStudentDocumentsQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'documents'],
    queryFn: async () => {
      const response = await tuyau
        .$route('api.v1.responsavel.api.studentDocuments', { studentId })
        .$get()
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar documentos')
      }
      return response.data
    },
    enabled: !!studentId,
  }
}
