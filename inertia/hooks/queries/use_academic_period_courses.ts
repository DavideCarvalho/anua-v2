import { tuyau } from '../../lib/api'

export function useAcademicPeriodCoursesQueryOptions(academicPeriodId: string) {
  return {
    queryKey: ['academic-period', academicPeriodId, 'courses'],
    queryFn: () => {
      return tuyau.api.v1['academic-periods']({ id: academicPeriodId }).courses.$get().unwrap()
    },
    enabled: !!academicPeriodId,
  }
}
