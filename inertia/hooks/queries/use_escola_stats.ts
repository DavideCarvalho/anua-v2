import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.escola.stats.$get

export type EscolaStats = InferResponseType<typeof $route>

export function useEscolaStatsQueryOptions() {
  return {
    queryKey: ['escola', 'stats'],
    queryFn: async () => {
      const response = await $route()
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar estatísticas')
      }
      return response.data
    },
  } satisfies QueryOptions
}
