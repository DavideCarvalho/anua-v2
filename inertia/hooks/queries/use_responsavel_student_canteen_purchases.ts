import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.responsavel.api.studentCanteenPurchases')
export type ResponsavelStudentCanteenPurchasesResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

interface UseResponsavelStudentCanteenPurchasesOptions {
  studentId: string
  page?: number
  limit?: number
}

export function useResponsavelStudentCanteenPurchasesQueryOptions({
  studentId,
  page = 1,
  limit = 20,
}: UseResponsavelStudentCanteenPurchasesOptions) {
  return {
    queryKey: ['responsavel', 'student-canteen-purchases', studentId, { page, limit }],
    queryFn: () =>
      tuyau
        .$route('api.v1.responsavel.api.studentCanteenPurchases', { studentId })
        .$get({ query: { page, limit } })
        .unwrap(),
    enabled: !!studentId,
  }
}
