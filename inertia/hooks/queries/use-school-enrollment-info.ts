import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.enrollment.info')

export type SchoolEnrollmentInfoResponse = InferResponseType<typeof $route.$get>

type EnrollmentInfoParams = NonNullable<Parameters<typeof $route.$get>[0]>['params']

export function useSchoolEnrollmentInfoQueryOptions(
  schoolSlug: string,
  academicPeriodSlug: string,
  courseSlug: string
) {
  const params: EnrollmentInfoParams = {
    schoolSlug,
    academicPeriodSlug,
    courseSlug,
  }

  return {
    queryKey: ['enrollment', 'info', schoolSlug, academicPeriodSlug, courseSlug],
    queryFn: () => {
      return $route.$get({ params }).unwrap()
    },
    enabled: !!schoolSlug && !!academicPeriodSlug && !!courseSlug,
  } satisfies QueryOptions<SchoolEnrollmentInfoResponse>
}
