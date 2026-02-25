import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.teachers.$get

export type TeachersResponse = InferResponseType<ReturnType<typeof resolveRoute>>

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

  return queryOptions({
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
        throw new Error(
          (response.error as { value?: { message?: string } } | undefined)?.value?.message ||
            'Erro ao carregar professores'
        )
      }
      return response.data
    },
  })
}
