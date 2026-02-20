import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.$route('api.v1.notificationPreferences.update')
type UpdatePreferencesBody = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$put']>[0]>

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdatePreferencesBody) => {
      return resolveRoute().$put(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
  })
}
