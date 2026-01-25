import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.contracts.getDocusealTemplate')

export type ContractDocusealTemplateResponse = InferResponseType<typeof $route.$get>

export function useContractDocusealTemplateQueryOptions(contractId: string) {
  const params = { contractId }

  return {
    queryKey: ['contracts', 'docuseal-template', params],
    queryFn: () => {
      return tuyau.$route('api.v1.contracts.getDocusealTemplate', params).$get().unwrap()
    },
  } satisfies QueryOptions<ContractDocusealTemplateResponse>
}
