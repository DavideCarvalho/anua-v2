import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.escola.insights.$get

export type EscolaInsightsResponse = InferResponseType<typeof $route>

export type Insight = {
  id: string
  type: 'financial' | 'enrollment' | 'academic'
  priority: 'high' | 'medium' | 'low'
  title: string
  value: number
  description: string
  icon: string
  metadata?: Record<string, unknown>
}

export function useEscolaInsightsQueryOptions() {
  return {
    queryKey: ['escola', 'insights'],
    queryFn: async () => {
      const response = await $route()
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar insights')
      }
      return response.data
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  } satisfies QueryOptions
}
