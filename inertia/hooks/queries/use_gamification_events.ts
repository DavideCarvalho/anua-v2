import { queryOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.gamificationEvents.index')
export type GamificationEventsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseGamificationEventsOptions {
  studentId?: string
  type?:
    | 'ASSIGNMENT_COMPLETED'
    | 'ASSIGNMENT_SUBMITTED'
    | 'ASSIGNMENT_GRADED'
    | 'ATTENDANCE_MARKED'
    | 'ATTENDANCE_PRESENT'
    | 'ATTENDANCE_LATE'
    | 'GRADE_RECEIVED'
    | 'GRADE_EXCELLENT'
    | 'GRADE_GOOD'
    | 'BEHAVIOR_POSITIVE'
    | 'BEHAVIOR_NEGATIVE'
    | 'PARTICIPATION_CLASS'
    | 'PARTICIPATION_EVENT'
    | 'STORE_PURCHASE'
    | 'STORE_ORDER_APPROVED'
    | 'STORE_ORDER_DELIVERED'
    | 'POINTS_MANUAL_ADD'
    | 'POINTS_MANUAL_REMOVE'
    | 'ACHIEVEMENT_UNLOCKED'
  status?: 'PENDING' | 'PROCESSED' | 'FAILED'
  page?: number
  limit?: number
}

export function useGamificationEventsQueryOptions(options: UseGamificationEventsOptions = {}) {
  const { studentId, type, status, page = 1, limit = 20 } = options

  return queryOptions({
    queryKey: ['gamification-events', { studentId, type, status, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.gamificationEvents.index')
        .$get({ query: { studentId, type, status, page, limit } })
        .unwrap()
    },
  })
}

// Get single event
const resolveShowRoute = () => tuyau.$route('api.v1.gamificationEvents.show')
export type GamificationEventResponse = InferResponseType<
  ReturnType<typeof resolveShowRoute>['$get']
>

export function useGamificationEventQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['gamification-event', id],
    queryFn: () => {
      return tuyau.$route('api.v1.gamificationEvents.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  })
}
