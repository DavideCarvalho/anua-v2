import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.students.$get

export type StudentsResponse = InferResponseType<typeof $route>

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
    queryFn: async () => {
      const response = await tuyau.api.v1.students.$get({
        query: {
          page,
          limit,
          search,
          classId,
          academicPeriodId,
          courseId,
          active,
        },
      })
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar alunos')
      }
      return response.data
    },
  } satisfies QueryOptions
}
