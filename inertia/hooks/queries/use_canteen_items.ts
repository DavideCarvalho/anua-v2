import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['canteen-items'].$get

export type CanteenItemsResponse = InferResponseType<typeof $route>

interface UseCanteenItemsParams {
  page?: number
  limit?: number
  canteenId?: string
  active?: boolean
}

export function useCanteenItemsQueryOptions(params: UseCanteenItemsParams = {}) {
  const { page = 1, limit = 20, canteenId, active } = params

  return {
    queryKey: ['canteen-items', { page, limit, canteenId, active }],
    queryFn: async () => {
      const response = await tuyau.api.v1['canteen-items'].$get({
        query: {
          page,
          limit,
          canteenId,
          active,
        },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar itens da cantina')
      }
      return response.data
    },
  } satisfies QueryOptions
}
