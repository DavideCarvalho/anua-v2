import { queryOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.challenges.index')
export type ChallengesResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseChallengesOptions {
  schoolId?: string
  category?: 'ATTENDANCE' | 'ACADEMIC' | 'BEHAVIOR' | 'EXTRACURRICULAR' | 'SPECIAL'
  isActive?: boolean
  page?: number
  limit?: number
}

export function useChallengesQueryOptions(options: UseChallengesOptions = {}) {
  const { schoolId, category, isActive, page = 1, limit = 20 } = options

  return queryOptions({
    queryKey: ['challenges', { schoolId, category, isActive, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.challenges.index')
        .$get({ query: { schoolId, category, isActive, page, limit } })
        .unwrap()
    },
  })
}

const resolveShowRoute = () => tuyau.$route('api.v1.challenges.show')
export type ChallengeResponse = InferResponseType<ReturnType<typeof resolveShowRoute>['$get']>

export function useChallengeQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['challenge', id],
    queryFn: () => {
      return tuyau.$route('api.v1.challenges.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  })
}
