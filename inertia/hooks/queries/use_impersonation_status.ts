import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.admin.impersonation.status.$get

export type ImpersonationStatus = InferResponseType<typeof $route>

export function useImpersonationStatusQueryOptions() {
  return {
    queryKey: ['impersonation', 'status'],
    queryFn: async () => {
      const response = await $route()
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao carregar status de personificação')
      }
      return response.data
    },
    staleTime: 0, // Sempre buscar status atualizado
  }
}
