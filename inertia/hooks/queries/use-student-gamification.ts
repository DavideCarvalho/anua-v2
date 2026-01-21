import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

// List student gamifications
const $listRoute = tuyau.$route('api.v1.studentGamifications.index')

export type StudentGamificationsResponse = InferResponseType<typeof $listRoute.$get>

interface UseStudentGamificationsOptions {
  schoolId?: string
  page?: number
  limit?: number
}

export function useStudentGamificationsQueryOptions(options: UseStudentGamificationsOptions = {}) {
  const { schoolId, page = 1, limit = 20 } = options

  return {
    queryKey: ['student-gamifications', { schoolId, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.studentGamifications.index')
        .$get({ query: { schoolId, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<StudentGamificationsResponse>
}

export function useStudentGamifications(options: UseStudentGamificationsOptions = {}) {
  return useSuspenseQuery(useStudentGamificationsQueryOptions(options))
}

// Get single student gamification
const $showRoute = tuyau.$route('api.v1.studentGamifications.show')

export type StudentGamificationResponse = InferResponseType<typeof $showRoute.$get>

export function useStudentGamificationQueryOptions(id: string) {
  return {
    queryKey: ['student-gamification', id],
    queryFn: () => {
      return tuyau.$route('api.v1.studentGamifications.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  } satisfies QueryOptions<StudentGamificationResponse>
}

export function useStudentGamification(id: string) {
  return useSuspenseQuery(useStudentGamificationQueryOptions(id))
}

// Get gamification ranking
const $rankingRoute = tuyau.$route('api.v1.studentGamifications.ranking')

export type GamificationRankingResponse = InferResponseType<typeof $rankingRoute.$get>

interface UseGamificationRankingOptions {
  schoolId?: string
  period?: 'week' | 'month' | 'year' | 'all'
  limit?: number
}

export function useGamificationRankingQueryOptions(options: UseGamificationRankingOptions = {}) {
  const { schoolId, period = 'month', limit = 10 } = options

  return {
    queryKey: ['gamification-ranking', { schoolId, period, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.studentGamifications.ranking')
        .$get({ query: { schoolId, period, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<GamificationRankingResponse>
}

export function useGamificationRanking(options: UseGamificationRankingOptions = {}) {
  return useSuspenseQuery(useGamificationRankingQueryOptions(options))
}

// Get student gamification stats
const $statsRoute = tuyau.$route('api.v1.students.gamificationStats')

export type StudentGamificationStatsResponse = InferResponseType<typeof $statsRoute.$get>

export function useStudentGamificationStatsQueryOptions(studentId: string) {
  return {
    queryKey: ['student-gamification-stats', studentId],
    queryFn: () => {
      return tuyau.$route('api.v1.students.gamificationStats', { id: studentId }).$get().unwrap()
    },
    enabled: !!studentId,
  } satisfies QueryOptions<StudentGamificationStatsResponse>
}

export function useStudentGamificationStats(studentId: string) {
  return useSuspenseQuery(useStudentGamificationStatsQueryOptions(studentId))
}
