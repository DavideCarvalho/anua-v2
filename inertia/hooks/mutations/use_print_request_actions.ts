import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.printRequests.createPrintRequest')
type CreatePrintRequestPayload = InferRequestType<ReturnType<typeof resolveCreateRoute>['$post']>

export function useCreatePrintRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePrintRequestPayload) => {
      return tuyau.$route('api.v1.printRequests.createPrintRequest').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}

export function useApprovePrintRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.printRequests.approvePrintRequest', { id }).$patch({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}

export function useRejectPrintRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback?: string }) => {
      return tuyau
        .$route('api.v1.printRequests.rejectPrintRequest', { id })
        .$patch({ reason: feedback ?? '' })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}

export function useReviewPrintRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        name: string
        dueDate: string
        fileUrl: string
        quantity: number
        frontAndBack?: boolean
      }
    }) => {
      return tuyau.$route('api.v1.printRequests.reviewPrintRequest', { id }).$patch(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}

export function useMarkPrintRequestPrinted() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau
        .$route('api.v1.printRequests.markPrintRequestPrinted', { id })
        .$patch({})
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
