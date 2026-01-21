import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.consents.pending')

export type PendingConsentsResponse = InferResponseType<typeof $route.$get>

export function usePendingConsentsQueryOptions() {
  return {
    queryKey: ['parental-consents', 'pending'],
    queryFn: () => {
      return $route.$get().unwrap()
    },
  } satisfies QueryOptions<PendingConsentsResponse>
}
