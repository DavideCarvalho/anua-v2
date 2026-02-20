import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.canteenMealReservations.index')
export type CanteenMealReservationsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

interface UseCanteenMealReservationsOptions {
  canteenId?: string
  mealId?: string
  studentId?: string
  status?: string
  date?: string
  page?: number
  limit?: number
}

export function useCanteenMealReservationsQueryOptions(
  options: UseCanteenMealReservationsOptions = {}
) {
  const { canteenId, mealId, studentId, status, date, page = 1, limit = 20 } = options

  return {
    queryKey: [
      'canteen-meal-reservations',
      { canteenId, mealId, studentId, status, date, page, limit },
    ],
    queryFn: () => {
      return tuyau
        .$route('api.v1.canteenMealReservations.index')
        .$get({ query: { canteenId, mealId, studentId, status, date, page, limit } as any })
        .unwrap()
    },
  } satisfies QueryOptions<CanteenMealReservationsResponse>
}
