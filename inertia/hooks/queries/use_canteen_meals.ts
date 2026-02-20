import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.canteenMeals.index')
export type CanteenMealsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseCanteenMealsOptions {
  canteenId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export function useCanteenMealsQueryOptions(options: UseCanteenMealsOptions = {}) {
  const { canteenId, startDate, endDate, page = 1, limit = 20 } = options

  return {
    queryKey: ['canteen-meals', { canteenId, startDate, endDate, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.canteenMeals.index')
        .$get({ query: { canteenId, startDate, endDate, page, limit } })
        .unwrap()
    },
  }
}

export function useCanteenMeals(options: UseCanteenMealsOptions = {}) {
  return useSuspenseQuery(useCanteenMealsQueryOptions(options))
}

// Get single meal
const resolveShowRoute = () => tuyau.$route('api.v1.canteenMeals.show')
export type CanteenMealResponse = InferResponseType<ReturnType<typeof resolveShowRoute>['$get']>

export function useCanteenMealQueryOptions(id: string) {
  return {
    queryKey: ['canteen-meal', id],
    queryFn: () => {
      return tuyau.$route('api.v1.canteenMeals.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  }
}

export function useCanteenMeal(id: string) {
  return useSuspenseQuery(useCanteenMealQueryOptions(id))
}
