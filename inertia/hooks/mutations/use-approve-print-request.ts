import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.printRequests.approvePrintRequest')

type ApproveParams = NonNullable<Parameters<typeof $route.$patch>[0]>['params']

export function useApprovePrintRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: ApproveParams) => {
      return $route.$patch({ params }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
