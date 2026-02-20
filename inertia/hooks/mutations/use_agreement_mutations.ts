import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface CreateAgreementPayload {
  invoiceIds: string[]
  installments: number
  startDate: string
  paymentDay: number
  paymentMethod?: 'PIX' | 'BOLETO'
  renegotiationDiscountType?: 'PERCENTAGE' | 'FLAT'
  renegotiationDiscountValue?: number
  finePercentage?: number
  dailyInterestPercentage?: number
  earlyDiscounts?: {
    discountType: 'PERCENTAGE' | 'FLAT'
    percentage?: number
    flatAmount?: number
    daysBeforeDeadline: number
  }[]
}

export function useCreateAgreementMutationOptions() {
  return {
    mutationFn: (data: CreateAgreementPayload) => {
      return tuyau.$route('api.v1.agreements.store').$post(data).unwrap()
    },
  } satisfies MutationOptions
}
