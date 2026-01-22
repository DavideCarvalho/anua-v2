import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $getRoute = tuyau.api.v1['academic-periods'][':id'].courses.$get

export type AcademicPeriodCoursesResponse = InferResponseType<typeof $getRoute>

export function useAcademicPeriodCoursesQueryOptions(academicPeriodId: string) {
  return {
    queryKey: ['academic-period', academicPeriodId, 'courses'],
    queryFn: () => {
      return $getRoute({ id: academicPeriodId }).unwrap()
    },
    enabled: !!academicPeriodId,
  } satisfies QueryOptions<AcademicPeriodCoursesResponse>
}
