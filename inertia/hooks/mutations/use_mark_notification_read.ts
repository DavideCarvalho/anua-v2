import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.notifications.markRead')

type MarkReadParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: MarkReadParams) => {
      return $route.$post({ params }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
