import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.purchaseRequests.reject')

type RejectParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']
type RejectBody = NonNullable<Parameters<typeof $route.$post>[0]>

export function useRejectPurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, ...body }: RejectBody & { params: RejectParams }) => {
      return $route.$post({ params, ...body }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
