import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.purchaseRequests.update')

type UpdateParams = NonNullable<Parameters<typeof $route.$put>[0]>['params']
type UpdateBody = NonNullable<Parameters<typeof $route.$put>[0]>

export function useUpdatePurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, ...body }: UpdateBody & { params: UpdateParams }) => {
      return $route.$put({ params, ...body }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
