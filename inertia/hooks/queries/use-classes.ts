import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.classes.$get

export type ClassesResponse = InferResponseType<typeof $route>

interface UseClassesParams {
  page?: number
  limit?: number
  levelId?: string
  academicPeriodId?: string
}

export function useClassesQueryOptions(params: UseClassesParams = {}) {
  const { page = 1, limit = 20, levelId, academicPeriodId } = params

  return {
    queryKey: ['classes', { page, limit, levelId, academicPeriodId }],
    queryFn: async () => {
      const response = await tuyau.api.v1.classes.$get({
        query: {
          page,
          limit,
          levelId,
          academicPeriodId,
        },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar turmas')
      }
      return response.data
    },
  } satisfies QueryOptions
}
