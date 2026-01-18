import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.printRequests.rejectPrintRequest')

type RejectParams = NonNullable<Parameters<typeof $route.$patch>[0]>['params']
type RejectBody = NonNullable<Parameters<typeof $route.$patch>[0]>['body']

export function useRejectPrintRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, body }: { params: RejectParams; body: RejectBody }) => {
      return $route.$patch({ params, body }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
