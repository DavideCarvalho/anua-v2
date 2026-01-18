import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.printRequests.reviewPrintRequest')

type ReviewParams = NonNullable<Parameters<typeof $route.$patch>[0]>['params']
type ReviewBody = NonNullable<Parameters<typeof $route.$patch>[0]>['body']

export function useReviewPrintRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, body }: { params: ReviewParams; body: ReviewBody }) => {
      return $route.$patch({ params, body }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-requests'] })
    },
  })
}
