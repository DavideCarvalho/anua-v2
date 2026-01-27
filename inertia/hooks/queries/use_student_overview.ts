import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsavel.api.studentOverview')

export type StudentOverview = InferResponseType<typeof $route.$get>

export function useStudentOverviewQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'student', studentId, 'overview'],
    queryFn: async () => {
      const response = await tuyau
        .$route('api.v1.responsavel.api.studentOverview', { studentId })
        .$get()
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar dados')
      }
      return response.data
    },
    enabled: !!studentId,
  } satisfies QueryOptions
}
