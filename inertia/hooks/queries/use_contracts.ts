import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.contracts.$get

export type ContractsResponse = InferResponseType<typeof $route>

interface UseContractsParams {
  page?: number
  limit?: number
  schoolId?: string
  status?: string
}

export function useContractsQueryOptions(params: UseContractsParams = {}) {
  const { page = 1, limit = 20, schoolId, status } = params

  return {
    queryKey: ['contracts', { page, limit, schoolId, status }],
    queryFn: async () => {
      const response = await tuyau.api.v1.contracts.$get({
        query: {
          page,
          limit,
          schoolId,
          status,
        },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar contratos')
      }
      return response.data
    },
  } satisfies QueryOptions
}
