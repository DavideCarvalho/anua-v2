import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.students.$get

export type StudentsResponse = InferResponseType<ReturnType<typeof resolveRoute>>

interface UseStudentsParams {
  page?: number
  limit?: number
  search?: string
  classId?: string
  academicPeriodId?: string
  courseId?: string
  active?: boolean
}

export function useStudentsQueryOptions(params: UseStudentsParams = {}) {
  const { page = 1, limit = 20, search, classId, academicPeriodId, courseId, active } = params

  return {
    queryKey: ['students', { page, limit, search, classId, academicPeriodId, courseId, active }],
    queryFn: () => {
      return resolveRoute()({
        query: {
          page,
          limit,
          search,
          classId,
          academicPeriodId,
          courseId,
          active,
        },
      }).unwrap()
    },
  } satisfies QueryOptions
}
