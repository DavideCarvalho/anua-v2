import { useEffect, useMemo } from 'react'
import { differenceInMonths } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Card, CardContent } from '~/components/ui/card'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Skeleton } from '~/components/ui/skeleton'
import {
  useStudentEnrollmentsQueryOptions,
  type StudentEnrollment,
} from '~/hooks/queries/use_student_enrollments'
import { useContractQueryOptions } from '~/hooks/queries/use_contract'
import { useScholarshipsQueryOptions } from '~/hooks/queries/use_scholarships'
import { useUpdateEnrollment } from '~/hooks/mutations/use_update_enrollment'
import {
  ContractDetailsCard,
  ScholarshipSelector,
  DiscountComparison,
} from '~/components/enrollment'
import { useStudentPendingPaymentsQueryOptions } from '~/hooks/queries/use_student_pending_payments'
import { formatCurrency } from '~/lib/utils'

const schema = z.object({
  contractId: z.string().min(1, 'Selecione um contrato'),
  scholarshipId: z.string().nullable(),
  paymentMethod: z.enum(['BOLETO', 'CREDIT_CARD', 'PIX']),
  paymentDay: z.number().min(1).max(31),
  installments: z.number().min(1).max(12),
  discountPercentage: z.number().min(0).max(100).optional(),
  enrollmentDiscountPercentage: z.number().min(0).max(100).optional(),
})

type FormData = z.infer<typeof schema>

const PaymentMethodLabels = {
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartao de Credito',
  PIX: 'PIX',
}

interface EditPaymentModalProps {
  studentId: string
  studentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function EnrollmentTabContent({
  enrollment,
  studentId,
  onSuccess,
}: {
  enrollment: StudentEnrollment
  studentId: string
  onSuccess?: () => void
}) {
  const { updateEnrollment, isPending } = useUpdateEnrollment()

  // Use enrollment's contractId, or fallback to level's contractId
  const initialContractId = enrollment.contractId ?? (enrollment.level as any)?.contractId ?? ''

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractId: initialContractId,
      scholarshipId: enrollment.scholarshipId ?? null,
      paymentMethod: enrollment.paymentMethod ?? 'BOLETO',
      paymentDay: enrollment.paymentDay ?? 5,
      installments: enrollment.installments ?? 12,
      discountPercentage: 0,
      enrollmentDiscountPercentage: 0,
    },
  })

  const contractId = form.watch('contractId') || initialContractId
  const scholarshipId = form.watch('scholarshipId')
  const discountPercentage = form.watch('discountPercentage') ?? 0
  const enrollmentDiscountPercentage = form.watch('enrollmentDiscountPercentage') ?? 0

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
    return contractData.paymentDays.map((pd: { day: number }) => pd.day).sort((a: number, b: number) => a - b)
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
      form.setValue('enrollmentDiscountPercentage', enrollment.scholarship.enrollmentDiscountPercentage)
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

  const watchedInstallments = form.watch('installments')
  const watchedPaymentDay = form.watch('paymentDay')

  // Calculate impact preview
  const impactPreview = useMemo(() => {
    if (!pendingPaymentsData || !contractData) return null

    const allPayments = pendingPaymentsData.data ?? []
    const unpaidStatuses = ['NOT_PAID', 'PENDING', 'OVERDUE']
    const affectedPayments = allPayments.filter(
      (p) =>
        p.studentHasLevelId === enrollment.id &&
        unpaidStatuses.includes(p.status) &&
        p.type !== 'ENROLLMENT'
    )

    if (affectedPayments.length === 0) return null

    const currentAmount = affectedPayments[0]?.amount ?? 0
    const currentDay = affectedPayments[0]?.dueDate
      ? new Date(String(affectedPayments[0].dueDate)).getDate()
      : null

    const installments = contractData.paymentType === 'UPFRONT'
      ? (watchedInstallments ?? contractData.installments)
      : 1

    let newInstallmentAmount: number
    if (contractData.paymentType === 'UPFRONT') {
      newInstallmentAmount = Math.floor(contractData.amount / installments)
    } else {
      newInstallmentAmount = contractData.amount
    }
    const newDiscountedAmount = Math.round(newInstallmentAmount * (1 - discountPercentage / 100))

    const amountChanged = newDiscountedAmount !== currentAmount
    const dayChanged = currentDay !== null && watchedPaymentDay !== currentDay

    if (!amountChanged && !dayChanged) return null

    return {
      count: affectedPayments.length,
      currentAmount,
      newAmount: newDiscountedAmount,
      amountChanged,
      dayChanged,
      currentDay,
      newDay: watchedPaymentDay,
    }
  }, [pendingPaymentsData, contractData, enrollment.id, discountPercentage, watchedInstallments, watchedPaymentDay])

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
      await updateEnrollment({
        studentId,
        enrollmentId: enrollment.id,
        data: {
          contractId: data.contractId,
          scholarshipId: data.scholarshipId,
          paymentMethod: data.paymentMethod,
          paymentDay: data.paymentDay,
          installments: data.installments,
        },
      })

      toast.success('Informacoes de pagamento atualizadas!')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating enrollment:', error)
      toast.error('Erro ao atualizar informacoes de pagamento')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        {/* Scholarship Selector */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <ScholarshipSelector
              scholarships={scholarships}
              value={scholarshipId}
              onChange={handleScholarshipChange}
              isLoading={false}
            />

            {(discountPercentage > 0 || enrollmentDiscountPercentage > 0) && contractData && (
              <DiscountComparison
                originalEnrollmentFee={contractData.enrollmentValue ?? 0}
                originalMonthlyFee={contractData.amount}
                enrollmentDiscountPercentage={enrollmentDiscountPercentage}
                monthlyDiscountPercentage={discountPercentage}
                installments={contractData.paymentType === 'MONTHLY' ? 12 : form.watch('installments')}
              />
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className={`grid gap-4 ${contractData?.paymentType === 'UPFRONT' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['BOLETO', 'CREDIT_CARD', 'PIX'] as const).map((method) => (
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
                    <FormLabel>Dia de Vencimento</FormLabel>
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
                      <FormLabel>Parcelas</FormLabel>
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

        {/* Impact Preview */}
        {impactPreview && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-amber-800">
                    {impactPreview.count} {impactPreview.count === 1 ? 'parcela pendente sera atualizada' : 'parcelas pendentes serao atualizadas'}
                  </p>
                  {impactPreview.amountChanged && (
                    <p className="text-amber-700">
                      Valor: {formatCurrency(impactPreview.currentAmount)} → {formatCurrency(impactPreview.newAmount)}
                    </p>
                  )}
                  {impactPreview.dayChanged && (
                    <p className="text-amber-700">
                      Vencimento: dia {impactPreview.currentDay} → dia {impactPreview.newDay}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alteracoes'
            )}
          </Button>
        </div>
      </form>
    </Form>
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
    return enrollments.filter((e: StudentEnrollment) => e.academicPeriod).sort((a: StudentEnrollment, b: StudentEnrollment) => {
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
              Este aluno nao possui matriculas ativas.
            </div>
          ) : (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="w-full justify-start">
                {enrollmentsByPeriod.map((enrollment: StudentEnrollment) => (
                  <TabsTrigger
                    key={enrollment.id}
                    value={enrollment.academicPeriodId ?? ''}
                  >
                    {enrollment.academicPeriod?.name ?? 'Periodo'}
                  </TabsTrigger>
                ))}
              </TabsList>

              {enrollmentsByPeriod.map((enrollment: StudentEnrollment) => (
                <TabsContent key={enrollment.id} value={enrollment.academicPeriodId ?? ''}>
                  <EnrollmentTabContent
                    enrollment={enrollment}
                    studentId={studentId}
                    onSuccess={handleSuccess}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-4 border-t bg-background shrink-0">
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
