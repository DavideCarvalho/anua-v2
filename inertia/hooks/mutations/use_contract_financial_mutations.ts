import { mutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface AddPaymentDayPayload {
  contractId: string
  day: number
}

export function addContractPaymentDayMutationOptions() {
  return mutationOptions({
    mutationFn: ({ contractId, day }: AddPaymentDayPayload) => {
      return tuyau
        .$route('api.v1.contracts.paymentDays.store', { contractId })
        .$post({ contractId, day })
        .unwrap()
    },
  })
}

export function removeContractPaymentDayMutationOptions() {
  return mutationOptions({
    mutationFn: ({ contractId, id }: { contractId: string; id: string }) => {
      return tuyau
        .$route('api.v1.contracts.paymentDays.destroy', { contractId, id })
        .$delete({})
        .unwrap()
    },
  })
}

interface UpdateInterestPayload {
  contractId: string
  delayInterestPercentage?: number
  delayInterestPerDayDelayed?: number
}

export function updateContractInterestConfigMutationOptions() {
  return mutationOptions({
    mutationFn: ({ contractId, ...data }: UpdateInterestPayload) => {
      return tuyau
        .$route('api.v1.contracts.interestConfig.update', { contractId })
        .$put(data)
        .unwrap()
    },
  })
}

interface AddDiscountPayload {
  contractId: string
  percentage: number
  daysBeforeDeadline: number
}

export function addContractEarlyDiscountMutationOptions() {
  return mutationOptions({
    mutationFn: ({ contractId, percentage, daysBeforeDeadline }: AddDiscountPayload) => {
      return tuyau
        .$route('api.v1.contracts.earlyDiscounts.store', { contractId })
        .$post({ contractId, percentage, daysBeforeDeadline })
        .unwrap()
    },
  })
}

export function removeContractEarlyDiscountMutationOptions() {
  return mutationOptions({
    mutationFn: ({ contractId, id }: { contractId: string; id: string }) => {
      return tuyau
        .$route('api.v1.contracts.earlyDiscounts.destroy', { contractId, id })
        .$delete({})
        .unwrap()
    },
  })
}
