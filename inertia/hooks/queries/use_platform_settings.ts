import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.platformSettings.show')
export type PlatformSettingsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function usePlatformSettingsQueryOptions() {
  return queryOptions({
    queryKey: ['platform-settings'],
    queryFn: () => {
      return tuyau.$route('api.v1.platformSettings.show').$get().unwrap()
    },
  })
}

export function usePlatformSettings() {
  return useSuspenseQuery(usePlatformSettingsQueryOptions())
}
