import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.platformSettings.show')

export type PlatformSettingsResponse = InferResponseType<typeof $route.$get>

export function usePlatformSettingsQueryOptions() {
  return {
    queryKey: ['platform-settings'],
    queryFn: () => {
      return tuyau.$route('api.v1.platformSettings.show').$get().unwrap()
    },
  } satisfies QueryOptions<PlatformSettingsResponse>
}

export function usePlatformSettings() {
  return useSuspenseQuery(usePlatformSettingsQueryOptions())
}
