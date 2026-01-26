import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.responsavel.api.students[':studentId'].overview.$get

export type StudentOverview = InferResponseType<typeof $route>

export function useStudentOverviewQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'student', studentId, 'overview'],
    queryFn: async () => {
      const response = await $route({ params: { studentId } })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar dados')
      }
      return response.data
    },
  } satisfies QueryOptions
}
