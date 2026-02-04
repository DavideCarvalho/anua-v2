import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { CurrencyInput } from '~/components/ui/currency-input'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { formatCurrency } from '~/lib/utils'
import { useMarkInvoicePaidMutationOptions } from '~/hooks/mutations/use_invoice_mutations'

const markPaidSchema = z.object({
  paymentMethod: z.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'OTHER'], {
    message: 'Selecione o método de pagamento',
  }),
  netAmountReceivedReais: z.coerce.number().min(0, 'Valor deve ser zero ou maior'),
  observation: z.string().optional(),
})

type MarkPaidFormData = z.infer<typeof markPaidSchema>

const paymentMethodLabels: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
  OTHER: 'Outro',
}

interface MarkInvoicePaidModalProps {
  invoice: {
    id: string
    totalAmount: number
    student?: { user?: { name?: string }; name?: string }
    month: number | null
    year: number | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarkInvoicePaidModal({ invoice, open, onOpenChange }: MarkInvoicePaidModalProps) {
  const queryClient = useQueryClient()
  const markPaid = useMutation(useMarkInvoicePaidMutationOptions())

  const form = useForm<MarkPaidFormData>({
    resolver: zodResolver(markPaidSchema) as any,
    defaultValues: {
      paymentMethod: undefined,
      netAmountReceivedReais: Number(invoice.totalAmount) / 100,
      observation: '',
    },
  })

  async function onSubmit(data: MarkPaidFormData) {
    try {
      await markPaid.mutateAsync({
        id: invoice.id,
        paymentMethod: data.paymentMethod,
        netAmountReceived: Math.round(data.netAmountReceivedReais * 100),
        observation: data.observation || undefined,
      })
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['student-pending-invoices'] })
      toast.success('Fatura marcada como paga')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao registrar pagamento')
    }
  }

  const studentName =
    invoice.student?.user?.name || invoice.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento da Fatura</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Aluno: <span className="font-medium text-foreground">{studentName}</span></p>
          {invoice.month && invoice.year && (
            <p>Referência: <span className="font-medium text-foreground">{invoice.month}/{invoice.year}</span></p>
          )}
          <p>Valor total: <span className="font-medium text-foreground">{formatCurrency(Number(invoice.totalAmount))}</span></p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(paymentMethodLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="netAmountReceivedReais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor líquido recebido</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={(val) => field.onChange(parseFloat(val) || 0)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Valor efetivamente recebido após taxas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Observações sobre o pagamento (opcional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={markPaid.isPending}>
                {markPaid.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
