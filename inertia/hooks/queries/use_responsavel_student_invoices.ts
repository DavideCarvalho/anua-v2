import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.responsavel.api.studentInvoices')
export type ResponsavelStudentInvoicesResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

interface UseResponsavelStudentInvoicesOptions {
  studentId: string
  page?: number
  limit?: number
}

export function useResponsavelStudentInvoicesQueryOptions({
  studentId,
  page = 1,
  limit = 20,
}: UseResponsavelStudentInvoicesOptions) {
  return {
    queryKey: ['responsavel', 'student-invoices', studentId, { page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.responsavel.api.studentInvoices', { studentId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!studentId,
  }
}
