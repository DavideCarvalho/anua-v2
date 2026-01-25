import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.canteenMealReservations.store')
type CreateReservationPayload = InferRequestType<typeof $createRoute.$post>

export function useCreateCanteenMealReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReservationPayload) => {
      return tuyau.$route('api.v1.canteenMealReservations.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-meal-reservations'] })
    },
  })
}

export function useUpdateCanteenMealReservationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return tuyau
        .$route('api.v1.canteenMealReservations.updateStatus', { id })
        .$put({ status })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-meal-reservations'] })
    },
  })
}

export function useCancelCanteenMealReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.canteenMealReservations.cancel', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-meal-reservations'] })
    },
  })
}

// Monthly Transfers
const $createTransferRoute = tuyau.$route('api.v1.canteenMonthlyTransfers.store')
type CreateTransferPayload = InferRequestType<typeof $createTransferRoute.$post>

export function useCreateCanteenMonthlyTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransferPayload) => {
      return tuyau.$route('api.v1.canteenMonthlyTransfers.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-monthly-transfers'] })
    },
  })
}

export function useUpdateCanteenMonthlyTransferStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return tuyau
        .$route('api.v1.canteenMonthlyTransfers.updateStatus', { id })
        .$put({ status })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-monthly-transfers'] })
    },
  })
}
