import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, ChevronDown } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { formatCurrency } from '~/lib/utils'
import { useStudentPendingInvoicesQueryOptions } from '~/hooks/queries/use_invoices'
import { useCreateAgreementMutationOptions } from '~/hooks/mutations/use_agreement_mutations'

const ACTIONABLE_STATUSES = ['OPEN', 'PENDING', 'OVERDUE']

const paymentMethodLabels: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
}

const statusLabels: Record<string, string> = {
  OPEN: 'Aberta',
  PENDING: 'Pendente',
  OVERDUE: 'Vencida',
}

const statusClasses: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const agreementSchema = z.object({
  selectedInvoiceIds: z.array(z.string()).min(1, 'Selecione pelo menos uma fatura'),
  installments: z.coerce.number().min(1, 'Mínimo 1 parcela').max(36, 'Máximo 36 parcelas'),
  startMonth: z.string().min(1, 'Mês de início é obrigatório'),
  paymentDay: z.coerce.number().min(1, 'Mínimo dia 1').max(31, 'Máximo dia 31'),
  paymentMethod: z.enum(['PIX', 'BOLETO']).optional(),
  renegotiationDiscountType: z.enum(['PERCENTAGE', 'FLAT']).optional(),
  renegotiationDiscountValue: z.coerce.number().min(1, 'Mínimo 1').optional(),
  finePercentage: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%').optional(),
  dailyInterestPercentage: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%').optional(),
  earlyDiscounts: z.array(
    z.object({
      discountType: z.enum(['PERCENTAGE', 'FLAT']),
      percentage: z.coerce.number().min(1, 'Mínimo 1%').max(100, 'Máximo 100%').optional(),
      flatAmount: z.coerce.number().min(1, 'Mínimo R$ 0,01').optional(),
      daysBeforeDeadline: z.coerce.number().min(1, 'Mínimo 1 dia').max(30, 'Máximo 30 dias'),
    })
  ),
})

type AgreementFormData = z.infer<typeof agreementSchema>

function getDiscountAmountInCents(
  installmentAmount: number,
  discount: AgreementFormData['earlyDiscounts'][number]
): number {
  if (discount.discountType === 'PERCENTAGE') {
    return Math.max(0, Math.round((installmentAmount * Number(discount.percentage ?? 0)) / 100))
  }

  return Math.max(0, Math.round(Number(discount.flatAmount ?? 0) * 100))
}

interface CreateAgreementModalProps {
  invoice: {
    id: string
    totalAmount: number
    status: string
    month: number | null
    year: number | null
    dueDate: string | Date | null
    student?: { id?: string; user?: { name?: string }; name?: string }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAgreementModal({ invoice, open, onOpenChange }: CreateAgreementModalProps) {
  const queryClient = useQueryClient()
  const createAgreement = useMutation(useCreateAgreementMutationOptions())
  const [discountsOpen, setDiscountsOpen] = useState(false)

  const studentId = (invoice as any).studentId || invoice.student?.id

  const { data: invoicesData, isLoading } = useQuery({
    ...useStudentPendingInvoicesQueryOptions(studentId),
    enabled: open && !!studentId,
  })

  const allInvoices = useMemo(() => {
    const list = (invoicesData as any)?.data ?? []
    return list
      .filter((inv: any) => ACTIONABLE_STATUSES.includes(inv.status))
      .sort((a: any, b: any) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
        return dateA - dateB
      })
  }, [invoicesData])

  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema) as any,
    defaultValues: {
      selectedInvoiceIds: [invoice.id],
      installments: 3,
      startMonth: new Date().toISOString().slice(0, 7),
      paymentDay: 10,
      paymentMethod: undefined,
      renegotiationDiscountType: undefined,
      renegotiationDiscountValue: undefined,
      finePercentage: undefined,
      dailyInterestPercentage: undefined,
      earlyDiscounts: [],
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        selectedInvoiceIds: [invoice.id],
        installments: 3,
        startMonth: new Date().toISOString().slice(0, 7),
        paymentDay: 10,
        paymentMethod: undefined,
        renegotiationDiscountType: undefined,
        renegotiationDiscountValue: undefined,
        finePercentage: undefined,
        dailyInterestPercentage: undefined,
        earlyDiscounts: [],
      })
      setDiscountsOpen(false)
    }
  }, [open, invoice.id])

  const selectedIds = form.watch('selectedInvoiceIds')
  const installments = form.watch('installments')
  const startMonthStr = form.watch('startMonth')
  const paymentDay = form.watch('paymentDay')
  const paymentMethod = form.watch('paymentMethod')
  const renegotiationDiscountType = form.watch('renegotiationDiscountType')
  const renegotiationDiscountValue = form.watch('renegotiationDiscountValue')
  const finePercentage = form.watch('finePercentage')
  const dailyInterestPercentage = form.watch('dailyInterestPercentage')
  const earlyDiscounts = form.watch('earlyDiscounts')

  const totalAmount = useMemo(() => {
    return allInvoices
      .filter((inv: any) => selectedIds.includes(inv.id))
      .reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0)
  }, [allInvoices, selectedIds])

  const renegotiationDiscountAmount = useMemo(() => {
    if (!renegotiationDiscountType || !renegotiationDiscountValue) return 0

    if (renegotiationDiscountType === 'PERCENTAGE') {
      return Math.min(
        totalAmount,
        Math.round((totalAmount * Number(renegotiationDiscountValue)) / 100)
      )
    }

    return Math.min(totalAmount, Math.round(Number(renegotiationDiscountValue) * 100))
  }, [renegotiationDiscountType, renegotiationDiscountValue, totalAmount])
  const netTotalAmount = Math.max(0, totalAmount - renegotiationDiscountAmount)
  const netInstallmentAmount = installments > 0 ? netTotalAmount / installments : 0
  const bestDiscountAmount = earlyDiscounts.reduce((maxDiscount, discount) => {
    const discountAmount = getDiscountAmountInCents(netInstallmentAmount, discount)
    return discountAmount > maxDiscount ? discountAmount : maxDiscount
  }, 0)
  const discountedInstallmentAmount = Math.max(0, netInstallmentAmount - bestDiscountAmount)

  function toggleInvoice(invoiceId: string) {
    const current = form.getValues('selectedInvoiceIds')
    if (current.includes(invoiceId)) {
      form.setValue(
        'selectedInvoiceIds',
        current.filter((id) => id !== invoiceId),
        { shouldValidate: true }
      )
    } else {
      form.setValue('selectedInvoiceIds', [...current, invoiceId], { shouldValidate: true })
    }
  }

  function addDiscount() {
    const current = form.getValues('earlyDiscounts')
    form.setValue('earlyDiscounts', [
      ...current,
      { discountType: 'PERCENTAGE', percentage: 5, flatAmount: undefined, daysBeforeDeadline: 5 },
    ])
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
        invoiceIds: data.selectedInvoiceIds,
        installments: data.installments,
        startDate: `${data.startMonth}-01`,
        paymentDay: data.paymentDay,
        paymentMethod: data.paymentMethod,
        renegotiationDiscountType: data.renegotiationDiscountType,
        renegotiationDiscountValue:
          data.renegotiationDiscountType === 'FLAT'
            ? Math.round(Number(data.renegotiationDiscountValue ?? 0) * 100)
            : data.renegotiationDiscountValue,
        finePercentage: data.finePercentage,
        dailyInterestPercentage: data.dailyInterestPercentage,
        earlyDiscounts:
          data.earlyDiscounts.length > 0
            ? data.earlyDiscounts.map((discount) => ({
                discountType: discount.discountType,
                percentage:
                  discount.discountType === 'PERCENTAGE'
                    ? Number(discount.percentage ?? 0)
                    : undefined,
                flatAmount:
                  discount.discountType === 'FLAT'
                    ? Math.round(Number(discount.flatAmount ?? 0) * 100)
                    : undefined,
                daysBeforeDeadline: discount.daysBeforeDeadline,
              }))
            : undefined,
      })
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['student-pending-invoices'] })
      toast.success('Acordo criado com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao criar acordo')
    }
  }

  const studentName = invoice.student?.user?.name || invoice.student?.name || 'Aluno'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-150 h-[90vh] flex flex-col p-0 overflow-hidden">
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
              {/* Section 1: Invoice selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Faturas</h3>
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isLoading && allInvoices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma fatura pendente encontrada
                  </p>
                )}
                {!isLoading &&
                  allInvoices.map((inv: any) => (
                    <label
                      key={inv.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedIds.includes(inv.id)}
                        onCheckedChange={() => toggleInvoice(inv.id)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">
                            {inv.month && inv.year ? `${inv.month}/${inv.year}` : '-'}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            Venc: {formatDate(inv.dueDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {formatCurrency(Number(inv.totalAmount))}
                          </span>
                          <Badge variant="secondary" className={statusClasses[inv.status] || ''}>
                            {statusLabels[inv.status] || inv.status}
                          </Badge>
                        </div>
                      </div>
                    </label>
                  ))}
                {form.formState.errors.selectedInvoiceIds && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.selectedInvoiceIds.message}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  {selectedIds.length} fatura(s) selecionada(s) &mdash;{' '}
                  <span className="font-medium text-foreground">
                    Total: {formatCurrency(totalAmount)}
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
                    name="startMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mês de início</FormLabel>
                        <FormControl>
                          <Input
                            type="month"
                            min={new Date().toISOString().slice(0, 7)}
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

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de pagamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione (opcional)" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="renegotiationDiscountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desconto da renegociação</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sem desconto" />
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

                    <FormField
                      control={form.control}
                      name="renegotiationDiscountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do desconto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              step={renegotiationDiscountType === 'PERCENTAGE' ? '0.01' : '0.01'}
                              placeholder={
                                renegotiationDiscountType === 'PERCENTAGE' ? 'Ex: 10' : 'Ex: 150,00'
                              }
                              disabled={!renegotiationDiscountType}
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="finePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Multa por atraso (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="Ex: 2"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyInterestPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Juros ao dia (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="Ex: 0.33"
                            {...field}
                            value={field.value ?? ''}
                          />
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
                      {formatCurrency(netInstallmentAmount)}
                    </span>
                  </p>
                )}
              </div>

              {/* Section 3: Early payment discounts */}
              <Collapsible open={discountsOpen} onOpenChange={setDiscountsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-full items-center justify-between px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-left">
                        <p className="text-sm font-medium">Descontos da parcela (opcional)</p>
                        <p className="text-xs text-muted-foreground">
                          Clique para configurar desconto percentual ou valor fixo
                        </p>
                      </div>
                      {earlyDiscounts.length > 0 && (
                        <Badge variant="secondary">{earlyDiscounts.length}</Badge>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${discountsOpen ? 'rotate-180' : ''}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  {earlyDiscounts.map((discount, index) => (
                    <div key={index} className="flex items-end gap-3">
                      <FormField
                        control={form.control}
                        name={`earlyDiscounts.${index}.discountType`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tipo de desconto</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                      {discount.discountType === 'PERCENTAGE' ? (
                        <FormField
                          control={form.control}
                          name={`earlyDiscounts.${index}.percentage`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Desconto (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name={`earlyDiscounts.${index}.flatAmount`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Desconto (R$)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
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
                          {d.discountType === 'PERCENTAGE'
                            ? `${d.percentage}% de desconto`
                            : `${formatCurrency(Math.round(Number(d.flatAmount ?? 0) * 100))} de desconto`}{' '}
                          se pago até {d.daysBeforeDeadline} dia(s) antes do vencimento
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
                      Total original:{' '}
                      <span className="font-medium">{formatCurrency(totalAmount)}</span>
                    </p>
                    {renegotiationDiscountAmount > 0 && (
                      <p>
                        Desconto da renegociação:{' '}
                        <span className="font-medium">
                          -{formatCurrency(renegotiationDiscountAmount)}
                        </span>
                      </p>
                    )}
                    <p>
                      Total renegociado:{' '}
                      <span className="font-medium">{formatCurrency(netTotalAmount)}</span>
                    </p>
                    <p>
                      Parcelas:{' '}
                      <span className="font-medium">
                        {installments}x de {formatCurrency(netInstallmentAmount)}
                      </span>
                    </p>
                    {earlyDiscounts.length > 0 && (
                      <p>
                        Parcela com melhor desconto:{' '}
                        <span className="font-medium">
                          {formatCurrency(discountedInstallmentAmount)}
                        </span>
                      </p>
                    )}
                    {startMonthStr && (
                      <p>
                        Primeira parcela em:{' '}
                        <span className="font-medium">{formatDate(`${startMonthStr}-01`)}</span>
                      </p>
                    )}
                    <p>
                      Vencimento todo dia <span className="font-medium">{paymentDay}</span>
                    </p>
                    {paymentMethod && (
                      <p>
                        Pagamento via{' '}
                        <span className="font-medium">{paymentMethodLabels[paymentMethod]}</span>
                      </p>
                    )}
                    <p>
                      Cobrança: <span className="font-medium">À vista (todas as parcelas)</span>
                    </p>
                    {(finePercentage || dailyInterestPercentage) && (
                      <p>
                        {finePercentage ? `Multa: ${finePercentage}%` : ''}
                        {finePercentage && dailyInterestPercentage ? ' + ' : ''}
                        {dailyInterestPercentage ? `Juros: ${dailyInterestPercentage}% ao dia` : ''}
                      </p>
                    )}
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
