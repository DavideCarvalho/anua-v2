import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.contracts({ id: '' }).$get

export type ContractResponse = InferResponseType<typeof $route>

interface UseContractParams {
  id: string
}

export function useContractQueryOptions({ id }: UseContractParams) {
  return {
    queryKey: ['contract', id],
    queryFn: async () => {
      const response = await tuyau.api.v1.contracts({ id }).$get()
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar contrato')
      }
      return response.data
    },
    enabled: !!id,
  } satisfies QueryOptions
}
