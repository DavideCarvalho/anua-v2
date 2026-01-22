import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'

export function useAcademicPeriodCoursesQueryOptions(academicPeriodId: string) {
  return {
    queryKey: ['academic-period', academicPeriodId, 'courses'],
    queryFn: () => {
      return tuyau.api.v1['academic-periods']({ id: academicPeriodId }).courses.$get().unwrap()
    },
    enabled: !!academicPeriodId,
  } satisfies QueryOptions
}
