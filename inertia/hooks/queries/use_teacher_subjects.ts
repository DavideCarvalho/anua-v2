import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.teachers.listTeacherSubjects')

export type TeacherSubjectsResponse = InferResponseType<typeof $route.$get>

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
