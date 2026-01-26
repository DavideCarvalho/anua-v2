import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.contracts.show')

export type ContractResponse = InferResponseType<typeof $route.$get>

interface UseContractParams {
  id: string
}

export function useContractQueryOptions({ id }: UseContractParams) {
  return {
    queryKey: ['contract', id],
    queryFn: async () => {
      const response = await tuyau.$route('api.v1.contracts.show', { id }).$get()
      if (response.error) {
        const errorValue = response.error.value as { message?: string } | undefined
        throw new Error(errorValue?.message || 'Erro ao carregar contrato')
      }
      return response.data
    },
    enabled: !!id,
  }
}
