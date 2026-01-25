import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.teachers.listTeacherClasses')

export type TeacherClassesResponse = InferResponseType<typeof $route.$get>

export function useTeacherClassesQueryOptions(teacherId: string) {
  return {
    queryKey: ['teacher-classes', teacherId],
    queryFn: () => {
      return tuyau.$route('api.v1.teachers.listTeacherClasses', { id: teacherId }).$get({}).unwrap()
    },
    enabled: !!teacherId,
  } satisfies QueryOptions<TeacherClassesResponse>
}
