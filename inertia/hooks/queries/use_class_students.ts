import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.classes.students')

export type ClassStudentsResponse = InferResponseType<typeof $route.$get>

interface UseClassStudentsOptions {
  classId: string
  courseId: string
  academicPeriodId: string
  page?: number
  limit?: number
}

export function useClassStudentsQueryOptions(options: UseClassStudentsOptions) {
  const { classId, courseId, academicPeriodId, page = 1, limit = 50 } = options

  return {
    queryKey: ['class-students', { classId, courseId, academicPeriodId, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.classes.students', { id: classId })
        .$get({ query: { page, limit, courseId, academicPeriodId } })
        .unwrap()
    },
    enabled: !!classId && !!courseId && !!academicPeriodId,
  } satisfies QueryOptions<ClassStudentsResponse>
}

export function useClassStudents(options: UseClassStudentsOptions) {
  return useSuspenseQuery(useClassStudentsQueryOptions(options))
}

// Students count
const $countRoute = tuyau.$route('api.v1.classes.studentsCount')

export type ClassStudentsCountResponse = InferResponseType<typeof $countRoute.$get>

export function useClassStudentsCountQueryOptions(classId: string) {
  return {
    queryKey: ['class-students-count', classId],
    queryFn: () => {
      return tuyau.$route('api.v1.classes.studentsCount', { id: classId }).$get().unwrap()
    },
    enabled: !!classId,
  } satisfies QueryOptions<ClassStudentsCountResponse>
}

export function useClassStudentsCount(classId: string) {
  return useSuspenseQuery(useClassStudentsCountQueryOptions(classId))
}
