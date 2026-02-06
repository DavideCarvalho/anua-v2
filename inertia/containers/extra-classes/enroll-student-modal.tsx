import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useEnrollStudent } from '~/hooks/mutations/use_extra_class_mutations'
import { useExtraClassQueryOptions } from '~/hooks/queries/use_extra_classes'
import { useStudentsQueryOptions } from '~/hooks/queries/use_students'

const schema = z.object({
  studentId: z.string().min(1, 'Selecione o aluno'),
  paymentMethod: z.enum(['BOLETO', 'CREDIT_CARD', 'PIX'], {
    message: 'Selecione a forma de pagamento',
  }),
  paymentDay: z.coerce.number().min(1, 'Selecione o dia de vencimento'),
  scholarshipId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EnrollStudentModalProps {
  extraClassId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnrollStudentModal({
  extraClassId,
  open,
  onOpenChange,
}: EnrollStudentModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: '',
      paymentMethod: 'BOLETO',
      paymentDay: 0,
      scholarshipId: '',
    },
  })

  const enrollMutation = useEnrollStudent()

  const { data: extraClass } = useQuery({
    ...useExtraClassQueryOptions(extraClassId),
    enabled: open,
  })

  // Set first payment day as default when contract loads
  const firstPaymentDay = extraClass?.contract?.paymentDays?.[0]?.day
  const currentPaymentDay = form.watch('paymentDay')
  if (firstPaymentDay && currentPaymentDay === 0) {
    form.setValue('paymentDay', firstPaymentDay)
  }

  const { data: studentsData } = useQuery({
    ...useStudentsQueryOptions({ limit: 100 }),
    enabled: open,
  })

  const students = studentsData?.data ?? []

  const onSubmit = (values: FormValues) => {
    enrollMutation.mutate(
      {
        extraClassId,
        studentId: values.studentId,
        paymentMethod: values.paymentMethod,
        paymentDay: values.paymentDay,
        scholarshipId: values.scholarshipId || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Aluno inscrito com sucesso')
          form.reset()
          onOpenChange(false)
        },
        onError: () => toast.error('Erro ao inscrever aluno'),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Inscrever Aluno{extraClass ? ` - ${extraClass.name}` : ''}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Aluno</Label>
            <Select
              value={form.watch('studentId')}
              onValueChange={(v) => form.setValue('studentId', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.user?.name ?? s.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.studentId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.studentId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select
                value={form.watch('paymentMethod')}
                onValueChange={(v) => form.setValue('paymentMethod', v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOLETO">Boleto</SelectItem>
                  <SelectItem value="CREDIT_CARD">Cartao</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dia do Vencimento</Label>
              <Select
                value={form.watch('paymentDay')?.toString()}
                onValueChange={(v) => form.setValue('paymentDay', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {extraClass?.contract?.paymentDays?.map((pd: any) => (
                    <SelectItem key={pd.day} value={pd.day.toString()}>
                      Dia {pd.day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.paymentDay && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.paymentDay.message}
                </p>
              )}
            </div>
          </div>

          {extraClass?.contract && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Contrato: {extraClass.contract.name}
              </p>
              <p className="text-sm font-medium">
                Valor: R$ {(extraClass.contract.amount / 100).toFixed(2)}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enrollMutation.isPending}>
              {enrollMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Inscrever
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
