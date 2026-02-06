import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.storeInstallmentRules.store')

export type CreateStoreInstallmentRulePayload = InferRequestType<typeof $route.$post>

export function useCreateStoreInstallmentRuleMutationOptions() {
  return {
    mutationFn: (data: CreateStoreInstallmentRulePayload) => {
      return tuyau.$route('api.v1.storeInstallmentRules.store').$post(data).unwrap()
    },
  } satisfies MutationOptions
}
