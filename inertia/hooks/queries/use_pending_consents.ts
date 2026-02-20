import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.consents.pending')
export type PendingConsentsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function usePendingConsentsQueryOptions() {
  return {
    queryKey: ['parental-consents', 'pending'],
    queryFn: () => {
      return resolveRoute().$get().unwrap()
    },
  } satisfies QueryOptions<PendingConsentsResponse>
}
