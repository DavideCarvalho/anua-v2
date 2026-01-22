import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.users['school-employees'].$get

export type SchoolEmployeesResponse = InferResponseType<typeof $route>

interface UseSchoolEmployeesParams {
  page?: number
  limit?: number
  search?: string
  roles?: string[]
  status?: string
}

export function useSchoolEmployeesQueryOptions(params: UseSchoolEmployeesParams = {}) {
  const { page = 1, limit = 20, search, roles, status } = params

  return {
    queryKey: ['school-employees', { page, limit, search, roles, status }],
    queryFn: async () => {
      const response = await tuyau.api.v1.users['school-employees'].$get({
        query: {
          page,
          limit,
          search,
          roles,
          status,
        },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar funcionários')
      }
      return response.data
    },
  } satisfies QueryOptions
}
