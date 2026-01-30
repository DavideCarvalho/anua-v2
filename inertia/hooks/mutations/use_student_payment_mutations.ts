import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.studentPayments.store')
type CreateStudentPaymentPayload = InferRequestType<typeof $createRoute.$post>

const $updateRoute = tuyau.$route('api.v1.studentPayments.update')
type UpdateStudentPaymentPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useCreateStudentPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentPaymentPayload) => {
      return tuyau.$route('api.v1.studentPayments.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    },
  })
}

export function useUpdateStudentPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateStudentPaymentPayload) => {
      return tuyau.$route('api.v1.studentPayments.update', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-payment', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    },
  })
}

export function useCancelStudentPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.studentPayments.cancel', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    },
  })
}

export function useMarkPaymentAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      paidAt,
    }: {
      id: string
      paidAt?: string
    }) => {
      return tuyau
        .$route('api.v1.studentPayments.markPaid', { id })
        .$post({ paidAt })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    },
  })
}

export function useCreateAsaasCharge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.studentPayments.asaasCharge', { id }).$post({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    },
  })
}

export function useSendBoletoEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, email }: { id: string; email?: string }) => {
      return tuyau.$route('api.v1.studentPayments.sendBoleto', { id }).$post({ email }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
    },
  })
}

export function useGetBoletoUrl() {
  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.studentPayments.getBoleto', { id }).$get().unwrap()
    },
  })
}
