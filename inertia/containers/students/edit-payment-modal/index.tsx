import { useEffect, useMemo } from 'react'
import { differenceInMonths } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreditCard, Loader2, FileText } from 'lucide-react'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Skeleton } from '~/components/ui/skeleton'
import {
  useStudentEnrollmentsQueryOptions,
  type StudentEnrollment,
} from '~/hooks/queries/use_student_enrollments'
import { useContractQueryOptions } from '~/hooks/queries/use_contract'
import { useScholarshipsQueryOptions } from '~/hooks/queries/use_scholarships'
import {
  useUpdateEnrollment,
  type UpdateEnrollmentPayload,
} from '~/hooks/mutations/use_update_enrollment'
import {
  ContractDetailsCard,
  RequiredDocumentsList,
  ScholarshipSelector,
} from '~/components/enrollment'
import { useStudentPendingPaymentsQueryOptions } from '~/hooks/queries/use_student_pending_payments'
import { useStudentPendingInvoicesQueryOptions } from '~/hooks/queries/use_invoices'
import { formatCurrency } from '~/lib/utils'

const schema = z
  .object({
    contractId: z.string().min(1, 'Selecione um contrato'),
    benefitMode: z.enum(['NONE', 'SCHOLARSHIP', 'INDIVIDUAL']),
    scholarshipId: z.string().nullable(),
    paymentMethod: z.enum(['BOLETO', 'PIX']),
    paymentDay: z.number().min(1).max(31),
    installments: z.number().min(1).max(12),
    individualDiscountType: z.enum(['PERCENTAGE', 'FLAT']),
    individualDiscountPercentage: z.number().min(0).max(100).optional(),
    individualDiscountValueReais: z.number().min(0).optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    enrollmentDiscountPercentage: z.number().min(0).max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.benefitMode === 'SCHOLARSHIP' && !data.scholarshipId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scholarshipId'],
        message: 'Selecione uma bolsa',
      })
    }

    if (data.benefitMode === 'INDIVIDUAL') {
      if (
        data.individualDiscountType === 'PERCENTAGE' &&
        (data.individualDiscountPercentage ?? 0) <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['individualDiscountPercentage'],
          message: 'Informe um percentual maior que 0',
        })
      }

      if (data.individualDiscountType === 'FLAT' && (data.individualDiscountValueReais ?? 0) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['individualDiscountValueReais'],
          message: 'Informe um valor maior que 0',
        })
      }
    }
  })

type FormData = z.infer<typeof schema>

const PaymentMethodLabels = {
  BOLETO: 'Boleto',
  PIX: 'PIX',
}

interface EditPaymentModalProps {
  studentId: string
  studentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EnrollmentTabContent({
  enrollment,
  studentId,
  onSuccess,
  onClose,
  embedded = false,
}: {
  enrollment: StudentEnrollment
  studentId: string
  onSuccess?: () => void
  onClose?: () => void
  embedded?: boolean
}) {
  const queryClient = useQueryClient()
  const { mutateAsync: updateEnrollment, isPending } = useUpdateEnrollment()

  const currentIndividualDiscount = useMemo(() => {
    const discounts = ((enrollment as any).individualDiscounts ?? []) as Array<{
      discountType: 'PERCENTAGE' | 'FLAT'
      discountPercentage?: number | null
      discountValue?: number | null
    }>

    return discounts[0] ?? null
  }, [enrollment])

  const hasValidIndividualDiscount =
    !!currentIndividualDiscount &&
    ((currentIndividualDiscount.discountType === 'PERCENTAGE' &&
      (currentIndividualDiscount.discountPercentage ?? 0) > 0) ||
      (currentIndividualDiscount.discountType === 'FLAT' &&
        (currentIndividualDiscount.discountValue ?? 0) > 0))

  const initialIndividualDiscountType = currentIndividualDiscount?.discountType ?? 'PERCENTAGE'
  const initialIndividualDiscountPercentage = currentIndividualDiscount?.discountPercentage ?? 0
  const initialIndividualDiscountValueReais =
    currentIndividualDiscount?.discountType === 'FLAT'
      ? Number(currentIndividualDiscount.discountValue ?? 0) / 100
      : 0

  const initialBenefitMode: 'NONE' | 'SCHOLARSHIP' | 'INDIVIDUAL' = hasValidIndividualDiscount
    ? 'INDIVIDUAL'
    : enrollment.scholarshipId
      ? 'SCHOLARSHIP'
      : 'NONE'

  // Use enrollment's contractId, or fallback to level's contractId
  const initialContractId = enrollment.contractId ?? (enrollment.level as any)?.contractId ?? ''

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractId: initialContractId,
      benefitMode: initialBenefitMode,
      scholarshipId: enrollment.scholarshipId ?? null,
      paymentMethod: enrollment.paymentMethod === 'PIX' ? 'PIX' : 'BOLETO',
      paymentDay: enrollment.paymentDay ?? 5,
      installments: enrollment.installments ?? 12,
      individualDiscountType: initialIndividualDiscountType,
      individualDiscountPercentage: initialIndividualDiscountPercentage,
      individualDiscountValueReais: initialIndividualDiscountValueReais,
      discountPercentage: 0,
      enrollmentDiscountPercentage: 0,
    },
  })

  const contractId = form.watch('contractId') || initialContractId
  const benefitMode = form.watch('benefitMode')
  const scholarshipId = form.watch('scholarshipId')
  const individualDiscountType = form.watch('individualDiscountType')
  const individualDiscountPercentage = form.watch('individualDiscountPercentage') ?? 0
  const individualDiscountValueReais = form.watch('individualDiscountValueReais') ?? 0
  const discountPercentage = form.watch('discountPercentage') ?? 0

  // Fetch contract details
  const { data: contractData, isLoading: isLoadingContract } = useQuery({
    ...useContractQueryOptions(contractId),
    enabled: !!contractId,
  })

  // Fetch scholarships
  const { data: scholarshipsData } = useQuery({
    ...useScholarshipsQueryOptions({ active: true, limit: 100 }),
  })

  const scholarships = scholarshipsData?.data ?? []

  // Get available payment days from contract
  const availablePaymentDays = useMemo(() => {
    if (!contractData?.paymentDays?.length) return [5, 10, 15, 20] // fallback
    return contractData.paymentDays
      .map((pd: { day: number }) => pd.day)
      .sort((a: number, b: number) => a - b)
  }, [contractData?.paymentDays])

  // Calculate max installments based on flexibleInstallments
  const maxInstallments = useMemo(() => {
    if (!contractData) return 12

    if (contractData.flexibleInstallments && enrollment.academicPeriod?.endDate) {
      const endDate = new Date(String(enrollment.academicPeriod.endDate))
      const now = new Date()
      const monthsDiff = differenceInMonths(endDate, now)
      return Math.max(1, Math.min(monthsDiff, contractData.installments))
    }

    return contractData.installments
  }, [contractData, enrollment.academicPeriod?.endDate])

  // Initialize scholarship percentages from enrollment on mount
  useEffect(() => {
    if (enrollment.scholarship) {
      form.setValue('discountPercentage', enrollment.scholarship.discountPercentage)
      form.setValue(
        'enrollmentDiscountPercentage',
        enrollment.scholarship.enrollmentDiscountPercentage
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment.id])

  // Set installments to 1 for MONTHLY payment type
  useEffect(() => {
    if (contractData?.paymentType === 'MONTHLY') {
      form.setValue('installments', 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractData?.paymentType])

  // Fetch pending payments for this enrollment
  const { data: pendingPaymentsData } = useQuery({
    ...useStudentPendingPaymentsQueryOptions(studentId),
    enabled: !!studentId,
  })

  // Fetch pending invoices for this student
  const { data: invoicesData } = useQuery({
    ...useStudentPendingInvoicesQueryOptions(studentId),
    enabled: !!studentId,
  })

  const watchedInstallments = form.watch('installments')

  const baseContractAmount = useMemo(() => {
    if (!contractData) return 0

    if (contractData.paymentType === 'UPFRONT') {
      const installments = watchedInstallments ?? contractData.installments
      return Math.floor(contractData.amount / installments)
    }

    return contractData.amount
  }, [contractData, watchedInstallments])

  const benefitImpact = useMemo(() => {
    if (!contractData || benefitMode === 'NONE') return null

    let discountAmount = 0
    let discountDescription = ''

    if (benefitMode === 'SCHOLARSHIP') {
      discountAmount = Math.round(baseContractAmount * (discountPercentage / 100))
      discountDescription = `${discountPercentage}% (bolsa)`
    }

    if (benefitMode === 'INDIVIDUAL' && individualDiscountType === 'PERCENTAGE') {
      discountAmount = Math.round(baseContractAmount * (individualDiscountPercentage / 100))
      discountDescription = `${individualDiscountPercentage}% (desconto individual)`
    }

    if (benefitMode === 'INDIVIDUAL' && individualDiscountType === 'FLAT') {
      discountAmount = Math.round(individualDiscountValueReais * 100)
      discountDescription = `${formatCurrency(discountAmount)} (desconto individual)`
    }

    const discountedAmount = Math.max(0, baseContractAmount - discountAmount)
    const baseAmountLabel =
      contractData.paymentType === 'UPFRONT'
        ? 'Valor base da parcela no contrato'
        : 'Valor base da mensalidade no contrato'

    return {
      baseAmountLabel,
      baseAmount: baseContractAmount,
      discountAmount,
      discountDescription,
      discountedAmount,
    }
  }, [
    contractData,
    benefitMode,
    baseContractAmount,
    discountPercentage,
    individualDiscountType,
    individualDiscountPercentage,
    individualDiscountValueReais,
  ])

  // Calculate invoice impact preview
  const invoiceImpact = useMemo(() => {
    if (!invoicesData || !pendingPaymentsData || !contractData) return null

    const allPayments = pendingPaymentsData.data ?? []
    const invoices = invoicesData.data ?? []
    const unpaidStatuses = ['NOT_PAID', 'PENDING', 'OVERDUE']

    // Get affected payments for this enrollment
    const affectedPayments = allPayments.filter(
      (p) =>
        p.studentHasLevelId === enrollment.id &&
        unpaidStatuses.includes(p.status) &&
        p.type !== 'ENROLLMENT'
    )

    if (affectedPayments.length === 0) return null

    // Calculate new payment amount (same logic as impactPreview)
    const installments =
      contractData.paymentType === 'UPFRONT'
        ? (watchedInstallments ?? contractData.installments)
        : 1
    let newInstallmentAmount: number
    if (contractData.paymentType === 'UPFRONT') {
      newInstallmentAmount = Math.floor(contractData.amount / installments)
    } else {
      newInstallmentAmount = contractData.amount
    }
    const newDiscountedAmount =
      benefitMode === 'SCHOLARSHIP'
        ? Math.round(newInstallmentAmount * (1 - discountPercentage / 100))
        : benefitMode === 'INDIVIDUAL' && individualDiscountType === 'PERCENTAGE'
          ? Math.round(newInstallmentAmount * (1 - individualDiscountPercentage / 100))
          : benefitMode === 'INDIVIDUAL' && individualDiscountType === 'FLAT'
            ? Math.max(0, newInstallmentAmount - Math.round(individualDiscountValueReais * 100))
            : newInstallmentAmount

    // Find invoices affected by these payment changes
    const affectedInvoices: Array<{
      id: string
      month: number | null
      year: number | null
      currentTotal: number
      newTotal: number
    }> = []

    // Group affected payments by invoiceId
    const paymentsByInvoice = new Map<string, typeof affectedPayments>()
    for (const p of affectedPayments) {
      if (!p.invoiceId) continue
      if (!paymentsByInvoice.has(p.invoiceId)) paymentsByInvoice.set(p.invoiceId, [])
      paymentsByInvoice.get(p.invoiceId)!.push(p)
    }

    for (const [invoiceId, invoicePayments] of paymentsByInvoice) {
      const invoice = invoices.find((inv: any) => inv.id === invoiceId)
      if (!invoice) continue

      // Calculate: current invoice total - old payment amounts + new payment amounts
      const oldSum = invoicePayments.reduce((s, p) => s + Number(p.amount), 0)
      const newSum = invoicePayments.length * newDiscountedAmount
      const newTotal = Number(invoice.totalAmount) - oldSum + newSum

      if (newTotal !== Number(invoice.totalAmount)) {
        affectedInvoices.push({
          id: invoice.id,
          month: invoice.month,
          year: invoice.year,
          currentTotal: Number(invoice.totalAmount),
          newTotal,
        })
      }
    }

    return affectedInvoices.length > 0 ? affectedInvoices : null
  }, [
    invoicesData,
    pendingPaymentsData,
    contractData,
    enrollment.id,
    benefitMode,
    discountPercentage,
    individualDiscountType,
    individualDiscountPercentage,
    individualDiscountValueReais,
    watchedInstallments,
  ])

  const handleScholarshipChange = (
    newScholarshipId: string | null,
    scholarship: { discountPercentage: number; enrollmentDiscountPercentage: number } | null
  ) => {
    form.setValue('scholarshipId', newScholarshipId)
    form.setValue('discountPercentage', scholarship?.discountPercentage ?? 0)
    form.setValue('enrollmentDiscountPercentage', scholarship?.enrollmentDiscountPercentage ?? 0)
  }

  async function handleSubmit(data: FormData) {
    try {
      const updateData: UpdateEnrollmentPayload = {}

      if (data.contractId !== initialContractId) {
        updateData.contractId = data.contractId
      }

      const desiredScholarshipId = data.benefitMode === 'SCHOLARSHIP' ? data.scholarshipId : null
      if (desiredScholarshipId !== (enrollment.scholarshipId ?? null)) {
        updateData.scholarshipId = desiredScholarshipId
      }

      const currentPaymentMethod = enrollment.paymentMethod === 'PIX' ? 'PIX' : 'BOLETO'
      if (data.paymentMethod !== currentPaymentMethod) {
        updateData.paymentMethod = data.paymentMethod
      }

      if (data.paymentDay !== (enrollment.paymentDay ?? 5)) {
        updateData.paymentDay = data.paymentDay
      }

      const currentInstallments = enrollment.installments ?? 12
      if (data.installments !== currentInstallments) {
        updateData.installments = data.installments
      }

      const individualDiscountChanged =
        data.benefitMode !== initialBenefitMode ||
        data.individualDiscountType !== initialIndividualDiscountType ||
        (data.individualDiscountType === 'PERCENTAGE' &&
          (data.individualDiscountPercentage ?? 0) !== initialIndividualDiscountPercentage) ||
        (data.individualDiscountType === 'FLAT' &&
          (data.individualDiscountValueReais ?? 0) !== initialIndividualDiscountValueReais)

      if (individualDiscountChanged) {
        if (data.benefitMode !== 'INDIVIDUAL') {
          updateData.individualDiscount = null
        } else if (data.individualDiscountType === 'PERCENTAGE') {
          updateData.individualDiscount = {
            name: 'Desconto personalizado',
            discountType: 'PERCENTAGE',
            discountPercentage: data.individualDiscountPercentage ?? 0,
          }
        } else {
          updateData.individualDiscount = {
            name: 'Desconto personalizado',
            discountType: 'FLAT',
            discountValue: Math.round((data.individualDiscountValueReais ?? 0) * 100),
          }
        }
      }

      await updateEnrollment({
        studentId,
        enrollmentId: enrollment.id,
        data: updateData,
      })

      queryClient.invalidateQueries({ queryKey: ['student-enrollments', studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student-payments'] })
      queryClient.invalidateQueries({ queryKey: ['student-pending-payments', studentId] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['student-pending-invoices', studentId] })

      toast.success('Informações de pagamento atualizadas!')
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error('Error updating enrollment:', error)
      toast.error('Erro ao atualizar informações de pagamento')
    }
  }

  const formId = `enrollment-form-${enrollment.id}`

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Contract Info Card */}
        {isLoadingContract ? (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : contractData ? (
          <ContractDetailsCard
            name={contractData.name}
            enrollmentValue={contractData.enrollmentValue}
            monthlyFee={contractData.amount}
            installments={contractData.installments}
            enrollmentInstallments={contractData.enrollmentValueInstallments}
            paymentType={contractData.paymentType}
          />
        ) : null}

        {/* Benefit */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <FormField
              control={form.control}
              name="benefitMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefício</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value: 'NONE' | 'SCHOLARSHIP' | 'INDIVIDUAL') => {
                      field.onChange(value)

                      if (value !== 'SCHOLARSHIP') {
                        form.setValue('scholarshipId', null)
                        form.setValue('discountPercentage', 0)
                        form.setValue('enrollmentDiscountPercentage', 0)
                      }

                      if (value !== 'INDIVIDUAL') {
                        form.setValue('individualDiscountType', 'PERCENTAGE')
                        form.setValue('individualDiscountPercentage', 0)
                        form.setValue('individualDiscountValueReais', 0)
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">Sem benefício</SelectItem>
                      <SelectItem value="SCHOLARSHIP">Bolsa</SelectItem>
                      <SelectItem value="INDIVIDUAL">Desconto individual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {benefitMode === 'NONE' && (
              <p className="text-xs text-muted-foreground">
                Nenhum benefício aplicado. Mensalidades seguem o valor original do contrato.
              </p>
            )}

            {benefitMode === 'SCHOLARSHIP' && (
              <ScholarshipSelector
                scholarships={scholarships}
                value={scholarshipId}
                onChange={handleScholarshipChange}
                isLoading={false}
              />
            )}

            {benefitMode === 'INDIVIDUAL' && (
              <div className="grid grid-cols-3 gap-3 items-end">
                <FormField
                  control={form.control}
                  name="individualDiscountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto Individual</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value: 'PERCENTAGE' | 'FLAT') => {
                          field.onChange(value)
                        }}
                      >
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

                {individualDiscountType === 'PERCENTAGE' && (
                  <FormField
                    control={form.control}
                    name="individualDiscountPercentage"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Percentual da mensalidade (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {individualDiscountType === 'FLAT' && (
                  <FormField
                    control={form.control}
                    name="individualDiscountValueReais"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Valor da mensalidade (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {benefitImpact && (
              <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
                <p>
                  {benefitImpact.baseAmountLabel}:{' '}
                  <span className="font-medium text-foreground">
                    {formatCurrency(benefitImpact.baseAmount)}
                  </span>
                </p>
                <p>
                  Desconto aplicado:{' '}
                  <span className="font-medium text-foreground">
                    -{formatCurrency(benefitImpact.discountAmount)}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    ({benefitImpact.discountDescription})
                  </span>
                </p>
                <p>
                  Valor final:{' '}
                  <span className="font-medium text-foreground">
                    {formatCurrency(benefitImpact.discountedAmount)}
                  </span>
                </p>
              </div>
            )}

            {contractData && (
              <p className="text-xs text-muted-foreground">
                Escolha apenas uma opção de benefício por matrícula: bolsa ou desconto individual.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div
              className={`grid gap-4 ${contractData?.paymentType === 'UPFRONT' ? 'grid-cols-3' : 'grid-cols-2'}`}
            >
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['BOLETO', 'PIX'] as const).map((method) => (
                          <SelectItem key={method} value={method}>
                            {PaymentMethodLabels[method]}
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
                name="paymentDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento*</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePaymentDays.map((day: number) => (
                          <SelectItem key={day} value={day.toString()}>
                            Dia {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {contractData?.paymentType === 'UPFRONT' && (
                <FormField
                  control={form.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas*</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Impact Preview */}
        {invoiceImpact && (
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-2 text-sm w-full">
                  <p className="font-medium">
                    {invoiceImpact.length}{' '}
                    {invoiceImpact.length === 1
                      ? 'fatura será atualizada'
                      : 'faturas serão atualizadas'}
                  </p>
                  <div className="rounded border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left px-3 py-1.5 font-medium">Fatura</th>
                          <th className="text-right px-3 py-1.5 font-medium">Atual</th>
                          <th className="text-right px-3 py-1.5 font-medium">Novo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[...invoiceImpact]
                          .sort((a, b) => {
                            const dateA = (a.year ?? 0) * 12 + (a.month ?? 0)
                            const dateB = (b.year ?? 0) * 12 + (b.month ?? 0)
                            return dateA - dateB
                          })
                          .map((inv) => (
                            <tr key={inv.id}>
                              <td className="px-3 py-1.5">
                                {inv.month?.toString().padStart(2, '0')}/{inv.year}
                              </td>
                              <td className="px-3 py-1.5 text-right text-muted-foreground line-through">
                                {formatCurrency(inv.currentTotal)}
                              </td>
                              <td className="px-3 py-1.5 text-right font-medium">
                                {formatCurrency(inv.newTotal)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {contractData?.contractDocuments && contractData.contractDocuments.length > 0 && (
          <RequiredDocumentsList documents={contractData.contractDocuments} />
        )}

        {!embedded && <div className="h-16" />}

        {embedded && (
          <DialogFooter>
            <Button type="submit" form={formId} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        )}
      </form>

      {!embedded && (
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button type="submit" form={formId} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </div>
      )}
    </Form>
  )
}

export function EditPaymentSection({
  studentId,
  studentName: _studentName,
  onSuccess,
}: Omit<EditPaymentModalProps, 'open' | 'onOpenChange'>) {
  const { data: enrollments, isLoading } = useQuery({
    ...useStudentEnrollmentsQueryOptions(studentId),
    enabled: !!studentId,
  })

  const enrollmentsByPeriod = useMemo(() => {
    if (!enrollments) return []
    return enrollments
      .filter((e: StudentEnrollment) => e.academicPeriod)
      .sort((a: StudentEnrollment, b: StudentEnrollment) => {
        const dateA = new Date(String(a.academicPeriod?.startDate ?? 0))
        const dateB = new Date(String(b.academicPeriod?.startDate ?? 0))
        return dateB.getTime() - dateA.getTime()
      })
  }, [enrollments])

  const defaultTab = enrollmentsByPeriod[0]?.academicPeriodId ?? ''

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (enrollmentsByPeriod.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Este aluno não possui matrículas ativas.
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full justify-start">
          {enrollmentsByPeriod.map((enrollment: StudentEnrollment) => (
            <TabsTrigger key={enrollment.id} value={enrollment.academicPeriodId ?? ''}>
              {enrollment.academicPeriod?.name ?? 'Período'}
            </TabsTrigger>
          ))}
        </TabsList>

        {enrollmentsByPeriod.map((enrollment: StudentEnrollment) => (
          <TabsContent key={enrollment.id} value={enrollment.academicPeriodId ?? ''}>
            <EnrollmentTabContent
              enrollment={enrollment}
              studentId={studentId}
              onSuccess={onSuccess}
              embedded
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export function EditPaymentModal({
  studentId,
  studentName,
  open,
  onOpenChange,
  onSuccess,
}: EditPaymentModalProps) {
  const { data: enrollments, isLoading } = useQuery({
    ...useStudentEnrollmentsQueryOptions(studentId),
    enabled: open && !!studentId,
  })

  // Group enrollments by academic period
  const enrollmentsByPeriod = useMemo(() => {
    if (!enrollments) return []
    return enrollments
      .filter((e: StudentEnrollment) => e.academicPeriod)
      .sort((a: StudentEnrollment, b: StudentEnrollment) => {
        const dateA = new Date(String(a.academicPeriod?.startDate ?? 0))
        const dateB = new Date(String(b.academicPeriod?.startDate ?? 0))
        return dateB.getTime() - dateA.getTime()
      })
  }, [enrollments])

  const defaultTab = enrollmentsByPeriod[0]?.academicPeriodId ?? ''

  function handleClose() {
    onOpenChange(false)
  }

  function handleSuccess() {
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Editar Pagamento
            </DialogTitle>
          </DialogHeader>

          {/* Student Info */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3 mt-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {studentName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{studentName}</h3>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : enrollmentsByPeriod.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Este aluno não possui matrículas ativas.
            </div>
          ) : (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="w-full justify-start">
                {enrollmentsByPeriod.map((enrollment: StudentEnrollment) => (
                  <TabsTrigger key={enrollment.id} value={enrollment.academicPeriodId ?? ''}>
                    {enrollment.academicPeriod?.name ?? 'Período'}
                  </TabsTrigger>
                ))}
              </TabsList>

              {enrollmentsByPeriod.map((enrollment: StudentEnrollment) => (
                <TabsContent key={enrollment.id} value={enrollment.academicPeriodId ?? ''}>
                  <EnrollmentTabContent
                    enrollment={enrollment}
                    studentId={studentId}
                    onSuccess={handleSuccess}
                    onClose={handleClose}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
