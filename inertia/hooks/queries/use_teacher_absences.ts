import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.teachers.absences.$get

export type TeacherAbsencesResponse = InferResponseType<typeof $route>

type TeacherAbsencesQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useTeacherAbsencesQueryOptions(query: TeacherAbsencesQuery) {
  return {
    queryKey: ['teachers', 'absences', query],
    queryFn: () => {
      return $route({ query }).unwrap()
    },
  } satisfies QueryOptions<TeacherAbsencesResponse>
}
