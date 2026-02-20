import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.enrollment.info')
export type SchoolEnrollmentInfoResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useSchoolEnrollmentInfoQueryOptions(
  schoolSlug: string,
  academicPeriodSlug: string,
  courseSlug: string
) {
  return {
    queryKey: ['enrollment', 'info', schoolSlug, academicPeriodSlug, courseSlug],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.enrollment.info', {
          schoolSlug,
          academicPeriodSlug,
          courseSlug,
        } as any)
        .$get()
        .unwrap()
    },
    enabled: !!schoolSlug && !!academicPeriodSlug && !!courseSlug,
  }
}
