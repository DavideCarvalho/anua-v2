import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
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
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useMarkPaymentAsPaid } from '~/hooks/mutations/use_student_payment_mutations'

const markPaidSchema = z.object({
  paidAt: z.string().min(1, 'Data do pagamento é obrigatória'),
  paymentMethod: z.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'CASH', 'OTHER'], {
    message: 'Selecione o método de pagamento',
  }),
  amountPaid: z.coerce.number().positive('Valor deve ser maior que zero'),
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

interface MarkPaidModalProps {
  payment: {
    id: string
    amount: number
    student?: { user?: { name?: string }; name?: string }
    month: number
    year: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarkPaidModal({ payment, open, onOpenChange }: MarkPaidModalProps) {
  const markPaid = useMarkPaymentAsPaid()

  const form = useForm<MarkPaidFormData>({
    resolver: zodResolver(markPaidSchema) as any,
    defaultValues: {
      paidAt: new Date().toISOString().split('T')[0],
      paymentMethod: undefined,
      amountPaid: Number(payment.amount),
      observation: '',
    },
  })

  const watchedAmount = form.watch('amountPaid')
  const originalAmount = Number(payment.amount)
  const isDifferentAmount = watchedAmount !== originalAmount && watchedAmount > 0

  async function onSubmit(data: MarkPaidFormData) {
    try {
      await markPaid.mutateAsync({
        id: payment.id,
        paidAt: data.paidAt,
        paymentMethod: data.paymentMethod,
        amountPaid: data.amountPaid,
        observation: data.observation || undefined,
      })
      toast.success('Pagamento registrado com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao registrar pagamento')
    }
  }

  const studentName =
    payment.student?.user?.name || payment.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Aluno: <span className="font-medium text-foreground">{studentName}</span></p>
          <p>Referência: <span className="font-medium text-foreground">{payment.month}/{payment.year}</span></p>
          <p>Valor: <span className="font-medium text-foreground">R$ {originalAmount.toFixed(2)}</span></p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor pago (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  {isDifferentAmount && (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Valor diferente do original
                    </Badge>
                  )}
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
