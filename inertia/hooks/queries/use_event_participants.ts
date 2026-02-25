import { queryOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.events.participants.index')
export type EventParticipantsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseEventParticipantsOptions {
  eventId: string
  status?: 'INVITED' | 'CONFIRMED' | 'DECLINED' | 'ATTENDED' | 'ABSENT'
  page?: number
  limit?: number
}

export function useEventParticipantsQueryOptions(options: UseEventParticipantsOptions) {
  const { eventId, status, page = 1, limit = 50 } = options

  return queryOptions({
    queryKey: ['event-participants', { eventId, status, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.events.participants.index', { eventId })
        .$get({ query: { status, page, limit } })
        .unwrap()
    },
    enabled: !!eventId,
  })
}
