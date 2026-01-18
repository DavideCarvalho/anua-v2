import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.printRequests.createPrintRequest')

export type CreatePrintRequestBody = Parameters<typeof $route.$post>[0]

export function useCreatePrintRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreatePrintRequestBody) => {
      return $route.$post(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
