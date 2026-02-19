import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CreateAsaasSubaccountPayload {
  name: string
  email: string
  cpfCnpj: string
  companyType: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION'
  birthDate?: string
  phone?: string
  mobilePhone?: string
  address: string
  addressNumber: string
  complement?: string
  province: string
  postalCode: string
  incomeValue: number
}

export function useCreateAsaasSubaccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAsaasSubaccountPayload) => {
      const response = await fetch('/api/v1/asaas/subaccounts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.description || 'Erro ao salvar dados da subconta Asaas')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asaas-payment-config'] })
    },
  })
}
