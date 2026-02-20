import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.events.store')
type CreateEventBody = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$post']>[0]>

export function useCreateEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateEventBody) => {
      return resolveRoute().$post(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
