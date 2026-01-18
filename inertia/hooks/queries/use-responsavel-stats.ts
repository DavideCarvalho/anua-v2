import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.responsavel.stats.$get

export type ResponsavelStats = InferResponseType<typeof $route>

export function useResponsavelStatsQueryOptions() {
  return {
    queryKey: ['responsavel', 'stats'],
    queryFn: async () => {
      const response = await $route()
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar dados')
      }
      return response.data
    },
  } satisfies QueryOptions
}
