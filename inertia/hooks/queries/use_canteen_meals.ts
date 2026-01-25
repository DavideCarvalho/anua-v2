import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.canteenMeals.index')

export type CanteenMealsResponse = InferResponseType<typeof $route.$get>

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
  } satisfies QueryOptions<CanteenMealsResponse>
}

export function useCanteenMeals(options: UseCanteenMealsOptions = {}) {
  return useSuspenseQuery(useCanteenMealsQueryOptions(options))
}

// Get single meal
const $showRoute = tuyau.$route('api.v1.canteenMeals.show')

export type CanteenMealResponse = InferResponseType<typeof $showRoute.$get>

export function useCanteenMealQueryOptions(id: string) {
  return {
    queryKey: ['canteen-meal', id],
    queryFn: () => {
      return tuyau.$route('api.v1.canteenMeals.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  } satisfies QueryOptions<CanteenMealResponse>
}

export function useCanteenMeal(id: string) {
  return useSuspenseQuery(useCanteenMealQueryOptions(id))
}
