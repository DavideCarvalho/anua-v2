import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.notificationPreferences.update')

type UpdatePreferencesBody = NonNullable<Parameters<typeof $route.$put>[0]>

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdatePreferencesBody) => {
      return $route.$put(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
  })
}
