import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.admin.stats.$get

export type AdminStats = InferResponseType<typeof $route>

export function useAdminStatsQueryOptions() {
  return {
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await $route()
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar estatísticas')
      }
      return response.data
    },
  } satisfies QueryOptions
}
