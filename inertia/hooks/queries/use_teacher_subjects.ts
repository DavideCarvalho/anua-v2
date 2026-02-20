import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.teachers.listTeacherSubjects')
export type TeacherSubjectsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useTeacherSubjectsQueryOptions(teacherId: string) {
  return {
    queryKey: ['teacher-subjects', teacherId],
    queryFn: () => {
      return tuyau
        .$route('api.v1.teachers.listTeacherSubjects', { id: teacherId })
        .$get({})
        .unwrap()
    },
  } satisfies QueryOptions<TeacherSubjectsResponse>
}
