import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.achievements.index')
export type AchievementsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseAchievementsOptions {
  schoolId?: string
  category?: 'ACADEMIC' | 'ATTENDANCE' | 'BEHAVIOR' | 'SOCIAL' | 'SPECIAL'
  isActive?: boolean
  page?: number
  limit?: number
}

export function useAchievementsQueryOptions(options: UseAchievementsOptions = {}) {
  const { schoolId, category, isActive, page = 1, limit = 20 } = options

  return {
    queryKey: ['achievements', { schoolId, category, isActive, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.achievements.index')
        .$get({ query: { schoolId, category, isActive, page, limit } })
        .unwrap()
    },
  }
}

export function useAchievements(options: UseAchievementsOptions = {}) {
  return useSuspenseQuery(useAchievementsQueryOptions(options))
}

// Get single achievement
const resolveShowRoute = () => tuyau.resolveRoute()('api.v1.achievements.show')
export type AchievementResponse = InferResponseType<ReturnType<typeof resolveShowRoute>['$get']>

export function useAchievementQueryOptions(id: string) {
  return {
    queryKey: ['achievement', id],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.achievements.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  }
}

export function useAchievement(id: string) {
  return useSuspenseQuery(useAchievementQueryOptions(id))
}
