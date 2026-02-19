import type { QueryOptions } from '@tanstack/react-query'

export interface AsaasPaymentConfigResponse {
  paymentConfigStatus:
    | 'NOT_CONFIGURED'
    | 'PENDING_DOCUMENTS'
    | 'PENDING_APPROVAL'
    | 'ACTIVE'
    | 'EXPIRING_SOON'
    | 'EXPIRED'
    | 'REJECTED'
  hasAsaasAccount: boolean
  documentUrl: string | null
}

export function useAsaasPaymentConfigQueryOptions() {
  return {
    queryKey: ['asaas-payment-config'],
    queryFn: async (): Promise<AsaasPaymentConfigResponse> => {
      const response = await fetch('/api/v1/asaas/subaccounts/status')
      if (!response.ok) {
        throw new Error('Erro ao buscar configuração de pagamento')
      }
      return response.json()
    },
    refetchInterval: (query: { state: { data?: AsaasPaymentConfigResponse } }) => {
      const status = query.state.data?.paymentConfigStatus
      if (status === 'PENDING_DOCUMENTS') {
        return 5000
      }
      return false
    },
  } satisfies QueryOptions<AsaasPaymentConfigResponse>
}
