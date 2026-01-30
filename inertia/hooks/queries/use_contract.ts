import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = (tuyau.api.v1.contracts as any)({ id: '' }).$get

export type ContractResponse = InferResponseType<typeof $route>

export function useContractQueryOptions(contractId: string | null | undefined) {
  return {
    queryKey: ['contract', contractId],
    queryFn: () => {
      if (!contractId) return null
      return (tuyau.api.v1.contracts as any)({ id: contractId }).$get().unwrap()
    },
    enabled: !!contractId,
  }
}
