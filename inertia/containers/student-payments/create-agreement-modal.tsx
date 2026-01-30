import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2 } from 'lucide-react'
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
import { Card, CardContent } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Badge } from '~/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import { useStudentPendingPaymentsQueryOptions } from '~/hooks/queries/use_student_pending_payments'
import { useCreateAgreement } from '~/hooks/mutations/use_agreement_mutations'

const ACTIONABLE_STATUSES = ['NOT_PAID', 'PENDING', 'OVERDUE']

const statusLabels: Record<string, string> = {
  NOT_PAID: 'Não pago',
  PENDING: 'Pendente',
  OVERDUE: 'Vencido',
}

const statusClasses: Record<string, string> = {
  NOT_PAID: 'bg-yellow-100 text-yellow-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const agreementSchema = z.object({
  selectedPaymentIds: z.array(z.string()).min(1, 'Selecione pelo menos um pagamento'),
  installments: z.coerce.number().min(1, 'Mínimo 1 parcela').max(36, 'Máximo 36 parcelas'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  paymentDay: z.coerce.number().min(1, 'Mínimo dia 1').max(31, 'Máximo dia 31'),
  earlyDiscounts: z.array(
    z.object({
      percentage: z.coerce.number().min(1, 'Mínimo 1%').max(100, 'Máximo 100%'),
      daysBeforeDeadline: z.coerce.number().min(1, 'Mínimo 1 dia').max(30, 'Máximo 30 dias'),
    })
  ),
})

type AgreementFormData = z.infer<typeof agreementSchema>

interface CreateAgreementModalProps {
  payment: {
    id: string
    studentId: string
    student?: { user?: { name?: string }; name?: string }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAgreementModal({ payment, open, onOpenChange }: CreateAgreementModalProps) {
  const createAgreement = useCreateAgreement()
  const [discountsOpen, setDiscountsOpen] = useState(false)

  const { data: paymentsData, isLoading } = useQuery({
    ...useStudentPendingPaymentsQueryOptions(payment.studentId),
    enabled: open,
  })

  const allPayments = useMemo(() => {
    const result = paymentsData as any
    const list = Array.isArray(result) ? result : result?.data || []
    return list.filter(
      (p: any) => ACTIONABLE_STATUSES.includes(p.status) && p.type !== 'AGREEMENT'
    )
  }, [paymentsData])

  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      selectedPaymentIds: [payment.id],
      installments: 3,
      startDate: new Date().toISOString().split('T')[0],
      paymentDay: 10,
      earlyDiscounts: [],
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        selectedPaymentIds: [payment.id],
        installments: 3,
        startDate: new Date().toISOString().split('T')[0],
        paymentDay: 10,
        earlyDiscounts: [],
      })
      setDiscountsOpen(false)
    }
  }, [open, payment.id])

  const selectedIds = form.watch('selectedPaymentIds')
  const installments = form.watch('installments')
  const startDateStr = form.watch('startDate')
  const paymentDay = form.watch('paymentDay')
  const earlyDiscounts = form.watch('earlyDiscounts')

  const totalAmount = useMemo(() => {
    return allPayments
      .filter((p: any) => selectedIds.includes(p.id))
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  }, [allPayments, selectedIds])

  const installmentAmount = installments > 0 ? totalAmount / installments : 0

  function togglePayment(paymentId: string) {
    const current = form.getValues('selectedPaymentIds')
    if (current.includes(paymentId)) {
      form.setValue(
        'selectedPaymentIds',
        current.filter((id) => id !== paymentId),
        { shouldValidate: true }
      )
    } else {
      form.setValue('selectedPaymentIds', [...current, paymentId], { shouldValidate: true })
    }
  }

  function addDiscount() {
    const current = form.getValues('earlyDiscounts')
    form.setValue('earlyDiscounts', [...current, { percentage: 5, daysBeforeDeadline: 5 }])
  }

  function removeDiscount(index: number) {
    const current = form.getValues('earlyDiscounts')
    form.setValue(
      'earlyDiscounts',
      current.filter((_, i) => i !== index)
    )
  }

  async function onSubmit(data: AgreementFormData) {
    try {
      await createAgreement.mutateAsync({
        paymentIds: data.selectedPaymentIds,
        installments: data.installments,
        startDate: data.startDate,
        paymentDay: data.paymentDay,
        earlyDiscounts: data.earlyDiscounts.length > 0 ? data.earlyDiscounts : undefined,
      })
      toast.success('Acordo criado com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao criar acordo')
    }
  }

  const studentName =
    payment.student?.user?.name || payment.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle>Criar Acordo de Pagamento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Aluno: <span className="font-medium text-foreground">{studentName}</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Section 1: Payment selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Pagamentos</h3>
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isLoading && allPayments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum pagamento pendente encontrado
                  </p>
                )}
                {!isLoading &&
                  allPayments.map((p: any) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedIds.includes(p.id)}
                        onCheckedChange={() => togglePayment(p.id)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">{p.month}/{p.year}</span>
                          <span className="text-muted-foreground ml-2">
                            Venc: {formatDate(p.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            R$ {Number(p.amount).toFixed(2)}
                          </span>
                          <Badge
                            variant="secondary"
                            className={statusClasses[p.status] || ''}
                          >
                            {statusLabels[p.status] || p.status}
                          </Badge>
                        </div>
                      </div>
                    </label>
                  ))}
                {form.formState.errors.selectedPaymentIds && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.selectedPaymentIds.message}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  {selectedIds.length} pagamento(s) selecionado(s) &mdash;{' '}
                  <span className="font-medium text-foreground">
                    Total: R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Section 2: Agreement terms */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Termos do Acordo</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parcelas</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="36" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de início</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do vencimento</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="31" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {installments > 0 && totalAmount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {installments} parcela(s) de{' '}
                    <span className="font-medium text-foreground">
                      R$ {installmentAmount.toFixed(2)}
                    </span>
                  </p>
                )}
              </div>

              {/* Section 3: Early payment discounts */}
              <Collapsible open={discountsOpen} onOpenChange={setDiscountsOpen}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="ghost" className="w-full justify-start p-0 h-auto">
                    <h3 className="text-sm font-medium">
                      Descontos por pagamento antecipado
                      {earlyDiscounts.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {earlyDiscounts.length}
                        </Badge>
                      )}
                    </h3>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  {earlyDiscounts.map((discount, index) => (
                    <div key={index} className="flex items-end gap-3">
                      <FormField
                        control={form.control}
                        name={`earlyDiscounts.${index}.percentage`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Desconto (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`earlyDiscounts.${index}.daysBeforeDeadline`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Dias antes</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDiscount(index)}
                        className="mb-1"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {earlyDiscounts.length > 0 && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {earlyDiscounts.map((d, i) => (
                        <p key={i}>
                          {d.percentage}% de desconto se pago até {d.daysBeforeDeadline} dia(s)
                          antes do vencimento
                        </p>
                      ))}
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={addDiscount}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar desconto
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* Summary card */}
              {totalAmount > 0 && installments > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-sm space-y-1">
                    <p>
                      Total: <span className="font-medium">R$ {totalAmount.toFixed(2)}</span>
                    </p>
                    <p>
                      Parcelas: <span className="font-medium">{installments}x de R$ {installmentAmount.toFixed(2)}</span>
                    </p>
                    {startDateStr && (
                      <p>
                        Primeira parcela em:{' '}
                        <span className="font-medium">{formatDate(startDateStr)}</span>
                      </p>
                    )}
                    <p>
                      Vencimento todo dia <span className="font-medium">{paymentDay}</span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter className="p-6 pt-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAgreement.isPending}>
                {createAgreement.isPending ? 'Criando...' : 'Criar Acordo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
