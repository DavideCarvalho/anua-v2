import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.contractDocuments.index')
export type ContractDocumentsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseContractDocumentsOptions {
  contractId?: string
  page?: number
  limit?: number
}

export function useContractDocumentsQueryOptions(options: UseContractDocumentsOptions = {}) {
  const { contractId, page = 1, limit = 20 } = options

  return {
    queryKey: ['contract-documents', { contractId, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.contractDocuments.index')
        .$get({ query: { contractId, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<ContractDocumentsResponse>
}

export function useContractDocuments(options: UseContractDocumentsOptions = {}) {
  return useSuspenseQuery(useContractDocumentsQueryOptions(options))
}
