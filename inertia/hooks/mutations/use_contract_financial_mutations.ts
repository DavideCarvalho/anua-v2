import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

// Payment Days
const $addPaymentDayRoute = tuyau.$route('api.v1.contracts.paymentDays.store')
type AddPaymentDayPayload = InferRequestType<typeof $addPaymentDayRoute.$post> & {
  contractId: string
}

export function useAddContractPaymentDay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId, ...data }: AddPaymentDayPayload) => {
      return tuyau.$route('api.v1.contracts.paymentDays.store', { contractId }).$post(data).unwrap()
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
const $updateInterestRoute = tuyau.$route('api.v1.contracts.interestConfig.update')
type UpdateInterestPayload = InferRequestType<typeof $updateInterestRoute.$put> & {
  contractId: string
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
const $addDiscountRoute = tuyau.$route('api.v1.contracts.earlyDiscounts.store')
type AddDiscountPayload = InferRequestType<typeof $addDiscountRoute.$post> & {
  contractId: string
}

export function useAddContractEarlyDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contractId, ...data }: AddDiscountPayload) => {
      return tuyau
        .$route('api.v1.contracts.earlyDiscounts.store', { contractId })
        .$post(data)
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
