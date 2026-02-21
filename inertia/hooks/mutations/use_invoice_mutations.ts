import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface MarkInvoicePaidPayload {
  id: string
  paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'CASH' | 'OTHER'
  netAmountReceived: number
  paidAt: string
  observation?: string
}

export function useMarkInvoicePaidMutationOptions() {
  return {
    mutationFn: ({ id, ...data }: MarkInvoicePaidPayload) => {
      return tuyau.$route('api.v1.invoices.markPaid', { id }).$post(data).unwrap()
    },
  } satisfies MutationOptions<unknown, Error, MarkInvoicePaidPayload, unknown>
}
