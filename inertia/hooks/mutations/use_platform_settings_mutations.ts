import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveUpdateRoute = () => tuyau.$route('api.v1.platformSettings.update')
type UpdatePlatformSettingsPayload = InferRequestType<ReturnType<typeof resolveUpdateRoute>['$put']>

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePlatformSettingsPayload) => {
      return tuyau.$route('api.v1.platformSettings.update').$put(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] })
    },
  })
}
