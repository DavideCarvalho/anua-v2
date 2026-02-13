import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import { formatCurrency } from '~/lib/utils'
import { useUpdateStudentPayment } from '~/hooks/mutations/use_student_payment_mutations'

const editPaymentSchema = z.object({
  amountReais: z.coerce.number().positive('Valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountPercentage: z.coerce.number().min(0).max(100, 'Desconto deve ser entre 0 e 100'),
  discountValueReais: z.coerce.number().min(0, 'Desconto fixo não pode ser negativo'),
})

type EditPaymentFormData = z.infer<typeof editPaymentSchema>

interface EditPaymentModalProps {
  payment: {
    id: string
    amount: number
    dueDate: string
    discountPercentage: number
    discountType?: 'PERCENTAGE' | 'FLAT'
    discountValue?: number
    student?: { user?: { name?: string }; name?: string }
    month: number
    year: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPaymentModal({ payment, open, onOpenChange }: EditPaymentModalProps) {
  const updatePayment = useUpdateStudentPayment()

  const form = useForm<EditPaymentFormData>({
    resolver: zodResolver(editPaymentSchema) as any,
    defaultValues: {
      amountReais: Number(payment.amount) / 100,
      dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      discountType: payment.discountType ?? 'PERCENTAGE',
      discountPercentage: payment.discountPercentage || 0,
      discountValueReais: Number(payment.discountValue ?? 0) / 100,
    },
  })

  const watchedAmount = form.watch('amountReais')
  const watchedDiscountType = form.watch('discountType')
  const watchedDiscount = form.watch('discountPercentage')
  const watchedDiscountValueReais = form.watch('discountValueReais')

  const finalAmountReais =
    watchedDiscountType === 'FLAT'
      ? Math.max(0, watchedAmount - watchedDiscountValueReais)
      : Math.max(0, watchedAmount - (watchedAmount * watchedDiscount) / 100)

  async function onSubmit(data: EditPaymentFormData) {
    try {
      await updatePayment.mutateAsync({
        id: payment.id,
        amount: Math.round(data.amountReais * 100),
        dueDate: data.dueDate,
        discountType: data.discountType,
        discountPercentage: data.discountType === 'PERCENTAGE' ? data.discountPercentage : 0,
        discountValue: data.discountType === 'FLAT' ? Math.round(data.discountValueReais * 100) : 0,
      })
      toast.success('Mensalidade atualizada com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao atualizar mensalidade')
    }
  }

  const studentName = payment.student?.user?.name || payment.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Mensalidade</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Aluno: <span className="font-medium text-foreground">{studentName}</span>
          </p>
          <p>
            Referência:{' '}
            <span className="font-medium text-foreground">
              {payment.month}/{payment.year}
            </span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amountReais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={(val) => field.onChange(parseFloat(val) || 0)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de desconto</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
                      <SelectItem value="FLAT">Valor fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedDiscountType === 'PERCENTAGE' ? (
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto (%)</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input type="number" min="0" max="100" className="w-24" {...field} />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        Valor final:{' '}
                        <span className="font-medium text-foreground">
                          {formatCurrency(Math.round(finalAmountReais * 100))}
                        </span>
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="discountValueReais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto fixo</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={(val) => field.onChange(parseFloat(val) || 0)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        Valor final:{' '}
                        <span className="font-medium text-foreground">
                          {formatCurrency(Math.round(finalAmountReais * 100))}
                        </span>
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updatePayment.isPending}>
                {updatePayment.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
