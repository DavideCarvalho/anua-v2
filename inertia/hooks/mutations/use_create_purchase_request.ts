import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.purchaseRequests.store')
type CreateBody = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$post']>[0]>

export function useCreatePurchaseRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateBody) => {
      return resolveRoute().$post(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    },
  })
}
