import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.events.participants.index')

export type EventParticipantsResponse = InferResponseType<typeof $route.$get>

interface UseEventParticipantsOptions {
  eventId: string
  status?: 'REGISTERED' | 'CONFIRMED' | 'CANCELLED' | 'ATTENDED'
  page?: number
  limit?: number
}

export function useEventParticipantsQueryOptions(options: UseEventParticipantsOptions) {
  const { eventId, status, page = 1, limit = 50 } = options

  return {
    queryKey: ['event-participants', { eventId, status, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.events.participants.index', { id: eventId })
        .$get({ query: { status, page, limit } })
        .unwrap()
    },
    enabled: !!eventId,
  } satisfies QueryOptions<EventParticipantsResponse>
}

export function useEventParticipants(options: UseEventParticipantsOptions) {
  return useSuspenseQuery(useEventParticipantsQueryOptions(options))
}
