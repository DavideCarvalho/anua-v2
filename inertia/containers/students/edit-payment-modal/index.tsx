import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreditCard, Loader2 } from 'lucide-react'
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
  const updateEnrollment = useUpdateEnrollment()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contractId: enrollment.contractId ?? '',
      scholarshipId: enrollment.scholarshipId ?? null,
      paymentMethod: enrollment.paymentMethod ?? 'BOLETO',
      paymentDay: enrollment.paymentDay ?? 5,
      installments: enrollment.installments ?? 12,
      discountPercentage: 0,
      enrollmentDiscountPercentage: 0,
    },
  })

  const contractId = form.watch('contractId')
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

  // Initialize scholarship percentages from enrollment on mount
  useEffect(() => {
    if (enrollment.scholarship) {
      form.setValue('discountPercentage', enrollment.scholarship.discountPercentage)
      form.setValue('enrollmentDiscountPercentage', enrollment.scholarship.enrollmentDiscountPercentage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment.id])

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
      await updateEnrollment.mutateAsync({
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
                installments={form.watch('installments')}
              />
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
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
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateEnrollment.isPending}>
            {updateEnrollment.isPending ? (
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
    return enrollments.filter((e) => e.academicPeriod).sort((a, b) => {
      const dateA = new Date(a.academicPeriod?.startDate ?? 0)
      const dateB = new Date(b.academicPeriod?.startDate ?? 0)
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Editar Pagamento
          </DialogTitle>
        </DialogHeader>

        {/* Student Info */}
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
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
              {enrollmentsByPeriod.map((enrollment) => (
                <TabsTrigger
                  key={enrollment.id}
                  value={enrollment.academicPeriodId ?? ''}
                >
                  {enrollment.academicPeriod?.name ?? 'Periodo'}
                </TabsTrigger>
              ))}
            </TabsList>

            {enrollmentsByPeriod.map((enrollment) => (
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

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
