import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

// Payment Days
interface AddPaymentDayPayload {
  contractId: string
  day: number
}

export function useAddContractPaymentDay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId, day }: AddPaymentDayPayload) => {
      return tuyau
        .$route('api.v1.contracts.paymentDays.store', { contractId })
        .$post({ contractId, day })
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['contract-payment-days', variables.contractId],
      })
    },
  })
}

export function useRemoveContractPaymentDay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId, id }: { contractId: string; id: string }) => {
      return tuyau
        .$route('api.v1.contracts.paymentDays.destroy', { contractId, id })
        .$delete({})
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['contract-payment-days', variables.contractId],
      })
    },
  })
}

// Interest Config
interface UpdateInterestPayload {
  contractId: string
  delayInterestPercentage?: number
  delayInterestPerDayDelayed?: number
}

export function useUpdateContractInterestConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId, ...data }: UpdateInterestPayload) => {
      return tuyau
        .$route('api.v1.contracts.interestConfig.update', { contractId })
        .$put(data)
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['contract-interest-config', variables.contractId],
      })
    },
  })
}

// Early Discounts
interface AddDiscountPayload {
  contractId: string
  percentage: number
  daysBeforeDeadline: number
}

export function useAddContractEarlyDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId, percentage, daysBeforeDeadline }: AddDiscountPayload) => {
      return tuyau
        .$route('api.v1.contracts.earlyDiscounts.store', { contractId })
        .$post({ contractId, percentage, daysBeforeDeadline })
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['contract-early-discounts', variables.contractId],
      })
    },
  })
}

export function useRemoveContractEarlyDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId, id }: { contractId: string; id: string }) => {
      return tuyau
        .$route('api.v1.contracts.earlyDiscounts.destroy', { contractId, id })
        .$delete({})
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['contract-early-discounts', variables.contractId],
      })
    },
  })
}
