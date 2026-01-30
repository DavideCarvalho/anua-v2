import { tuyau } from '../../lib/api'

export function useStudentPendingPaymentsQueryOptions(studentId: string | undefined) {
  return {
    queryKey: ['student-pending-payments', studentId],
    queryFn: () => {
      return tuyau.api.v1['student-payments']
        .$get({
          query: {
            studentId,
            limit: 100,
          },
        })
        .unwrap()
    },
    enabled: !!studentId,
  }
}
