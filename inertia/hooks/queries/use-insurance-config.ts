import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.config')

export type InsuranceConfigResponse = InferResponseType<typeof $route.$get>

export function useInsuranceConfigQueryOptions(schoolId: string) {
  return {
    queryKey: ['insurance', 'config', schoolId],
    queryFn: () => {
      return $route.$get({ query: { schoolId } }).unwrap()
    },
    enabled: !!schoolId,
  } satisfies QueryOptions<InsuranceConfigResponse>
}
