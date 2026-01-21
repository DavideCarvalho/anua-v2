import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.responsavel.students[':studentId'].documents.$get

export type StudentDocumentsResponse = InferResponseType<typeof $route>

export function useStudentDocumentsQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'documents'],
    queryFn: async () => {
      const response = await $route({
        params: { studentId },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar documentos')
      }
      return response.data
    },
  } satisfies QueryOptions
}
