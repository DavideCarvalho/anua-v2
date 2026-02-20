import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

interface AddPaymentDayPayload {
  contractId: string
  day: number
}

export function addContractPaymentDayMutationOptions(): MutationOptions<
  unknown,
  Error,
  AddPaymentDayPayload
> {
  return {
    mutationFn: ({ contractId, day }) => {
      return tuyau
        .$route('api.v1.contracts.paymentDays.store', { contractId })
        .$post({ contractId, day })
        .unwrap()
    },
  }
}

export function removeContractPaymentDayMutationOptions(): MutationOptions<
  unknown,
  Error,
  { contractId: string; id: string }
> {
  return {
    mutationFn: ({ contractId, id }) => {
      return tuyau
        .$route('api.v1.contracts.paymentDays.destroy', { contractId, id })
        .$delete({})
        .unwrap()
    },
  }
}

interface UpdateInterestPayload {
  contractId: string
  delayInterestPercentage?: number
  delayInterestPerDayDelayed?: number
}

export function updateContractInterestConfigMutationOptions(): MutationOptions<
  unknown,
  Error,
  UpdateInterestPayload
> {
  return {
    mutationFn: ({ contractId, ...data }) => {
      return tuyau
        .$route('api.v1.contracts.interestConfig.update', { contractId })
        .$put(data)
        .unwrap()
    },
  }
}

interface AddDiscountPayload {
  contractId: string
  percentage: number
  daysBeforeDeadline: number
}

export function addContractEarlyDiscountMutationOptions(): MutationOptions<
  unknown,
  Error,
  AddDiscountPayload
> {
  return {
    mutationFn: ({ contractId, percentage, daysBeforeDeadline }) => {
      return tuyau
        .$route('api.v1.contracts.earlyDiscounts.store', { contractId })
        .$post({ contractId, percentage, daysBeforeDeadline })
        .unwrap()
    },
  }
}

export function removeContractEarlyDiscountMutationOptions(): MutationOptions<
  unknown,
  Error,
  { contractId: string; id: string }
> {
  return {
    mutationFn: ({ contractId, id }) => {
      return tuyau
        .$route('api.v1.contracts.earlyDiscounts.destroy', { contractId, id })
        .$delete({})
        .unwrap()
    },
  }
}
