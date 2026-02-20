import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.exams.$get

export type ExamsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

interface UseExamsParams {
  page?: number
  limit?: number
  classId?: string
  subjectId?: string
}

export function useExamsQueryOptions(params: UseExamsParams = {}) {
  const { page = 1, limit = 20, classId, subjectId } = params

  return {
    queryKey: ['exams', { page, limit, classId, subjectId }],
    queryFn: () =>
      tuyau.api.v1.exams
        .$get({
          query: {
            page,
            limit,
            classId,
            subjectId,
          },
        })
        .unwrap(),
  } satisfies QueryOptions
}
