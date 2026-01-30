import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.classes.subjects')

export type ClassSubjectsResponse = InferResponseType<typeof $route.$get>

interface UseClassSubjectsOptions {
  classId: string
  page?: number
  limit?: number
}

export function useClassSubjectsQueryOptions(options: UseClassSubjectsOptions) {
  const { classId, page = 1, limit = 50 } = options

  return {
    queryKey: ['class-subjects', { classId, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.classes.subjects', { classId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!classId,
  }
}

export function useClassSubjects(options: UseClassSubjectsOptions) {
  return useSuspenseQuery(useClassSubjectsQueryOptions(options))
}
