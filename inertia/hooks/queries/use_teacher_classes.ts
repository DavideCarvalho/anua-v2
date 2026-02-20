import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.teachers.listTeacherClasses')
export type TeacherClassesResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useTeacherClassesQueryOptions(teacherId: string) {
  return {
    queryKey: ['teacher-classes', teacherId],
    queryFn: () => {
      return tuyau.$route('api.v1.teachers.listTeacherClasses', { id: teacherId }).$get({}).unwrap()
    },
    enabled: !!teacherId,
  }
}
