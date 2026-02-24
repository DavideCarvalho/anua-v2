import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.teachers.absences.$get

export type TeacherAbsencesResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type TeacherAbsencesQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useTeacherAbsencesQueryOptions(query: TeacherAbsencesQuery) {
  return queryOptions({
    queryKey: ['teachers', 'absences', query],
    queryFn: () => {
      return resolveRoute()({ query }).unwrap()
    },
  })
}
