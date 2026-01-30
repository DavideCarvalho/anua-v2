import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface CreateAgreementPayload {
  paymentIds: string[]
  installments: number
  startDate: string
  paymentDay: number
  earlyDiscounts?: { percentage: number; daysBeforeDeadline: number }[]
}

export function useCreateAgreement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgreementPayload) => {
      return tuyau.$route('api.v1.agreements.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
      queryClient.invalidateQueries({ queryKey: ['student-pending-payments'] })
    },
  })
}
