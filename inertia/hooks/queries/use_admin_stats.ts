import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.admin.stats.$get

export type AdminStats = InferResponseType<ReturnType<typeof resolveRoute>>

export function useAdminStatsQueryOptions() {
  return queryOptions({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await resolveRoute()()
      if (response.error) {
        throw new Error(
          (response.error as { value?: { message?: string } } | undefined)?.value?.message ||
            'Erro ao carregar estatísticas'
        )
      }
      return response.data
    },
  })
}
