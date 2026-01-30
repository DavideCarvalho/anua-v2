import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.teachers.$get

export type TeachersResponse = InferResponseType<typeof $route>

interface UseTeachersParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
}

export function useTeachersQueryOptions(params: UseTeachersParams = {}) {
  const { page = 1, limit = 20, search, active } = params

  // Convert boolean to string to ensure proper serialization in query params
  const activeParam = active === undefined ? undefined : active ? 'true' : 'false'

  return {
    queryKey: ['teachers', { page, limit, search, active }],
    queryFn: async () => {
      const response = await tuyau.api.v1.teachers.$get({
        query: {
          page,
          limit,
          search,
          active: activeParam,
        },
      })
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar professores')
      }
      return response.data
    },
  } satisfies QueryOptions
}
