import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface CreateWalletTopUpPayload {
  studentId: string
  amount: number
  paymentMethod: 'PIX' | 'BOLETO'
}

export function useCreateWalletTopUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, ...data }: CreateWalletTopUpPayload) =>
      tuyau
        .$route('api.v1.responsavel.api.createWalletTopUp', { studentId })
        .$post(data as any)
        .unwrap(),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['responsavel', 'wallet-top-ups', variables.studentId] })
      qc.invalidateQueries({ queryKey: ['responsavel', 'student', variables.studentId, 'balance'] })
    },
  })
}
