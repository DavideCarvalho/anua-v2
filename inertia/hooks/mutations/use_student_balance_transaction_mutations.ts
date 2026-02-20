import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.studentBalanceTransactions.store')
type CreateStudentBalanceTransactionPayload = InferRequestType<
  ReturnType<typeof resolveCreateRoute>['$post']
>

export function useCreateStudentBalanceTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentBalanceTransactionPayload) => {
      return tuyau.$route('api.v1.studentBalanceTransactions.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-balance-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['student-balance'] })
    },
  })
}
