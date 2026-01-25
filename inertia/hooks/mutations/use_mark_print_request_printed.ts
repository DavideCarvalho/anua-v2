import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.printRequests.markPrintRequestPrinted')

type PrintedParams = NonNullable<Parameters<typeof $route.$patch>[0]>['params']

export function useMarkPrintRequestPrintedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: PrintedParams) => {
      return $route.$patch({ params }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
