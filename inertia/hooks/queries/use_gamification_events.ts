import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.gamificationEvents.index')
export type GamificationEventsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseGamificationEventsOptions {
  studentId?: string
  type?: string
  status?: 'PENDING' | 'PROCESSED' | 'FAILED'
  page?: number
  limit?: number
}

export function useGamificationEventsQueryOptions(options: UseGamificationEventsOptions = {}) {
  const { studentId, type, status, page = 1, limit = 20 } = options

  return {
    queryKey: ['gamification-events', { studentId, type, status, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.gamificationEvents.index')
        .$get({ query: { studentId, type, status, page, limit } as any })
        .unwrap()
    },
  }
}

export function useGamificationEvents(options: UseGamificationEventsOptions = {}) {
  return useSuspenseQuery(useGamificationEventsQueryOptions(options))
}

// Get single event
const resolveShowRoute = () => tuyau.resolveRoute()('api.v1.gamificationEvents.show')
export type GamificationEventResponse = InferResponseType<
  ReturnType<typeof resolveShowRoute>['$get']
>

export function useGamificationEventQueryOptions(id: string) {
  return {
    queryKey: ['gamification-event', id],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.gamificationEvents.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  }
}

export function useGamificationEvent(id: string) {
  return useSuspenseQuery(useGamificationEventQueryOptions(id))
}
