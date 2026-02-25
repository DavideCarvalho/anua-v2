import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.contracts.show', { id: '' }).$get

export type ContractResponse = InferResponseType<typeof $route>

export function useContractQueryOptions(contractId: string | null | undefined) {
  return queryOptions({
    queryKey: ['contract', contractId],
    queryFn: () => {
      if (!contractId) return null
      return tuyau.$route('api.v1.contracts.show', { id: contractId }).$get().unwrap()
    },
    enabled: !!contractId,
  })
}
