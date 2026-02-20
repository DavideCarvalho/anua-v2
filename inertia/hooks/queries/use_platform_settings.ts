import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.platformSettings.show')
export type PlatformSettingsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function usePlatformSettingsQueryOptions() {
  return {
    queryKey: ['platform-settings'],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.platformSettings.show').$get().unwrap()
    },
  } satisfies QueryOptions<PlatformSettingsResponse>
}

export function usePlatformSettings() {
  return useSuspenseQuery(usePlatformSettingsQueryOptions())
}
