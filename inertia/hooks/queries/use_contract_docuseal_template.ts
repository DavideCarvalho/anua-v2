import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.contracts.getDocusealTemplate')
export type ContractDocusealTemplateResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useContractDocusealTemplateQueryOptions(contractId: string) {
  const params = { contractId }

  return {
    queryKey: ['contracts', 'docuseal-template', params],
    queryFn: () => {
      return tuyau.$route('api.v1.contracts.getDocusealTemplate', params).$get().unwrap()
    },
  } satisfies QueryOptions<ContractDocusealTemplateResponse>
}
