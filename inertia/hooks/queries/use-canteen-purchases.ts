import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['canteen-purchases'].$get

export type CanteenPurchasesResponse = InferResponseType<typeof $route>

interface UseCanteenPurchasesParams {
  page?: number
  limit?: number
  status?: string
  userId?: string
}

export function useCanteenPurchasesQueryOptions(params: UseCanteenPurchasesParams = {}) {
  const { page = 1, limit = 20, status, userId } = params

  return {
    queryKey: ['canteen-purchases', { page, limit, status, userId }],
    queryFn: async () => {
      const response = await tuyau.api.v1['canteen-purchases'].$get({
        query: {
          page,
          limit,
          status,
          userId,
        },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar compras da cantina')
      }
      return response.data
    },
  } satisfies QueryOptions
}
