import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.notifications.destroy')

type DeleteParams = NonNullable<Parameters<typeof $route.$delete>[0]>['params']

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: DeleteParams) => {
      return $route.$delete({ params }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
