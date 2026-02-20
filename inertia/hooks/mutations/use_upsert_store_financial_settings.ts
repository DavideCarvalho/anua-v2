import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.stores.financialSettings.upsert')
export type UpsertStoreFinancialSettingsPayload = InferRequestType<
  ReturnType<typeof resolveRoute>['$put']
> & {
  storeId: string
}

export function useUpsertStoreFinancialSettingsMutationOptions() {
  return {
    mutationFn: ({ storeId, ...data }: UpsertStoreFinancialSettingsPayload) => {
      return tuyau.$route('api.v1.stores.financialSettings.upsert', { storeId }).$put(data).unwrap()
    },
  } satisfies MutationOptions
}
