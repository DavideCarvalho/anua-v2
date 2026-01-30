import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.enrollment.info')

export type SchoolEnrollmentInfoResponse = InferResponseType<typeof $route.$get>

export function useSchoolEnrollmentInfoQueryOptions(
  schoolSlug: string,
  academicPeriodSlug: string,
  courseSlug: string
) {
  return {
    queryKey: ['enrollment', 'info', schoolSlug, academicPeriodSlug, courseSlug],
    queryFn: () => {
      return tuyau.$route('api.v1.enrollment.info', { schoolSlug, academicPeriodSlug, courseSlug } as any).$get().unwrap()
    },
    enabled: !!schoolSlug && !!academicPeriodSlug && !!courseSlug,
  }
}
