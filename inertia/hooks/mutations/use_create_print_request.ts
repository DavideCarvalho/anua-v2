import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.$route('api.v1.printRequests.createPrintRequest')
export type CreatePrintRequestBody = Parameters<ReturnType<typeof resolveRoute>['$post']>[0]

export function useCreatePrintRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreatePrintRequestBody) => {
      return resolveRoute().$post(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
