import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.attendance.classStudents')
export type AttendanceClassStudentsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

interface UseAttendanceClassStudentsOptions {
  classId: string
  courseId: string
  academicPeriodId: string
  page?: number
  limit?: number
}

export function useAttendanceClassStudentsQueryOptions(options: UseAttendanceClassStudentsOptions) {
  const { classId, courseId, academicPeriodId, page = 1, limit = 20 } = options

  return {
    queryKey: ['class-students-attendance', { classId, courseId, academicPeriodId, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.attendance.classStudents', { classId })
        .$get({ query: { page, limit, courseId, academicPeriodId } })
        .unwrap()
    },
    enabled: !!classId && !!courseId && !!academicPeriodId,
  } satisfies QueryOptions
}
