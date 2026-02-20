import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.events.show')
export type EventResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useEventQueryOptions(params: { id: string }) {
  return {
    queryKey: ['events', params.id],
    queryFn: () => {
      return tuyau.$route('api.v1.events.show', { id: params.id }).$get().unwrap()
    },
    enabled: !!params.id,
  }
}
