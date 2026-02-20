import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.insurance.config')
export type InsuranceConfigResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useInsuranceConfigQueryOptions(schoolId: string) {
  return {
    queryKey: ['insurance', 'config', schoolId],
    queryFn: () => {
      return resolveRoute().$get({ query: { schoolId } }).unwrap()
    },
    enabled: !!schoolId,
  }
}
