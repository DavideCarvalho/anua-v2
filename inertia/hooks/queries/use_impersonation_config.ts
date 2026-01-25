import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.admin.impersonation.config.$get

export type ImpersonationConfig = InferResponseType<typeof $route>

interface ImpersonationConfigParams {
  search?: string
  roleFilter?: string
  schoolFilter?: string
  page?: number
  limit?: number
}

export function useImpersonationConfigQueryOptions(params: ImpersonationConfigParams = {}) {
  const { search, roleFilter, schoolFilter, page = 1, limit = 20 } = params

  return {
    queryKey: ['impersonation', 'config', { search, roleFilter, schoolFilter, page, limit }],
    queryFn: async () => {
      const response = await $route({
        query: {
          search,
          roleFilter,
          schoolFilter,
          page,
          limit,
        },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar configuração de personificação')
      }
      return response.data
    },
  } satisfies QueryOptions
}
