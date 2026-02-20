import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.events.consents.index')
export type EventConsentsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useEventConsentsQueryOptions(eventId: string, query: Record<string, any> = {}) {
  return {
    queryKey: ['events', eventId, 'consents', query],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.events.consents.index', { eventId })
        .$get({ query } as any)
        .unwrap()
    },
    enabled: !!eventId,
  }
}
