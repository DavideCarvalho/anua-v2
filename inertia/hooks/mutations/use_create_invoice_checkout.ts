import { useMutation, useQueryClient } from '@tanstack/react-query'

interface InvoiceCheckoutResponse {
  invoiceUrl: string | null
}

export function useCreateInvoiceCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invoiceId: string): Promise<InvoiceCheckoutResponse> => {
      const response = await fetch(`/api/v1/responsavel/invoices/${invoiceId}/checkout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || errorBody?.description || 'Erro ao gerar cobrança')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responsavel', 'student-invoices'] })
    },
  })
}
