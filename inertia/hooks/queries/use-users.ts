import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.users.$get

export type UsersResponse = InferResponseType<typeof $route>

interface UseUsersParams {
  page?: number
  limit?: number
  search?: string
  schoolId?: string
  roleId?: string
  active?: boolean
}

export function useUsersQueryOptions(params: UseUsersParams = {}) {
  const { page = 1, limit = 20, search, schoolId, roleId, active } = params

  return {
    queryKey: ['users', { page, limit, search, schoolId, roleId, active }],
    queryFn: async () => {
      const response = await tuyau.api.v1.users.$get({
        query: {
          page,
          limit,
          search,
          schoolId,
          roleId,
          active,
        },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar usuários')
      }
      return response.data
    },
  } satisfies QueryOptions
}
