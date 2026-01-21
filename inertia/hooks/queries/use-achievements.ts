import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.achievements.index')

export type AchievementsResponse = InferResponseType<typeof $route.$get>

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
        .$route('api.v1.achievements.index')
        .$get({ query: { schoolId, category, isActive, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<AchievementsResponse>
}

export function useAchievements(options: UseAchievementsOptions = {}) {
  return useSuspenseQuery(useAchievementsQueryOptions(options))
}

// Get single achievement
const $showRoute = tuyau.$route('api.v1.achievements.show')

export type AchievementResponse = InferResponseType<typeof $showRoute.$get>

export function useAchievementQueryOptions(id: string) {
  return {
    queryKey: ['achievement', id],
    queryFn: () => {
      return tuyau.$route('api.v1.achievements.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  } satisfies QueryOptions<AchievementResponse>
}

export function useAchievement(id: string) {
  return useSuspenseQuery(useAchievementQueryOptions(id))
}
