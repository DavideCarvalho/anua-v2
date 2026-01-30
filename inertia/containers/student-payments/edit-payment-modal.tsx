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
import { Button } from '~/components/ui/button'
import { useUpdateStudentPayment } from '~/hooks/mutations/use_student_payment_mutations'

const editPaymentSchema = z.object({
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  discountPercentage: z.coerce.number().min(0).max(100, 'Desconto deve ser entre 0 e 100'),
})

type EditPaymentFormData = z.infer<typeof editPaymentSchema>

interface EditPaymentModalProps {
  payment: {
    id: string
    amount: number
    dueDate: string
    discountPercentage: number
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
    resolver: zodResolver(editPaymentSchema),
    defaultValues: {
      amount: Number(payment.amount),
      dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      discountPercentage: payment.discountPercentage || 0,
    },
  })

  const watchedAmount = form.watch('amount')
  const watchedDiscount = form.watch('discountPercentage')
  const finalAmount = watchedAmount - (watchedAmount * watchedDiscount) / 100

  async function onSubmit(data: EditPaymentFormData) {
    try {
      await updatePayment.mutateAsync({
        id: payment.id,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        discountPercentage: data.discountPercentage,
      })
      toast.success('Mensalidade atualizada com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao atualizar mensalidade')
    }
  }

  const studentName =
    payment.student?.user?.name || payment.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Mensalidade</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Aluno: <span className="font-medium text-foreground">{studentName}</span></p>
          <p>Referência: <span className="font-medium text-foreground">{payment.month}/{payment.year}</span></p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
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
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desconto (%)</FormLabel>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Input type="number" min="0" max="100" className="w-24" {...field} />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">
                      Valor final: <span className="font-medium text-foreground">R$ {finalAmount.toFixed(2)}</span>
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
