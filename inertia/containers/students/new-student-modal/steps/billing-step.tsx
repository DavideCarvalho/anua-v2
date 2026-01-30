import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import {
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
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use_academic_periods'
import { useAcademicPeriodCoursesQueryOptions } from '~/hooks/queries/use_academic_period_courses'
import { useClassesQueryOptions } from '~/hooks/queries/use_classes'
import { useContractQueryOptions } from '~/hooks/queries/use_contract'
import { useScholarshipsQueryOptions } from '~/hooks/queries/use_scholarships'
import { getCourseLabel, getLevelLabel } from '~/lib/formatters'
import {
  ContractDetailsCard,
  ScholarshipSelector,
  DiscountComparison,
  RequiredDocumentsList,
} from '~/components/enrollment'
import type { AcademicPeriodSegment } from '~/lib/formatters'
import type { NewStudentFormData, PaymentMethod } from '../schema'

const PaymentMethodLabels: Record<PaymentMethod, string> = {
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de Crédito',
  PIX: 'PIX',
}

export function BillingStep() {
  const form = useFormContext<NewStudentFormData>()

  const academicPeriodId = form.watch('billing.academicPeriodId')
  const courseId = form.watch('billing.courseId')
  const levelId = form.watch('billing.levelId')

  const { data: academicPeriodsData } = useQuery(
    useAcademicPeriodsQueryOptions({ limit: 50 })
  )

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    ...useAcademicPeriodCoursesQueryOptions(academicPeriodId),
    enabled: !!academicPeriodId,
  })

  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    ...useClassesQueryOptions({ levelId, academicPeriodId, limit: 50 }),
    enabled: !!levelId && !!academicPeriodId,
  })

  const academicPeriods = academicPeriodsData?.data ?? []
  const courses = coursesData ?? []
  const selectedPeriod = academicPeriods.find((p) => p.id === academicPeriodId)
  const segment = (selectedPeriod?.segment ?? 'ELEMENTARY') as AcademicPeriodSegment
  const selectedCourse = courses.find((c) => c.courseId === courseId)
  const levels = selectedCourse?.levels ?? []
  const classes = classesData?.data ?? []

  const courseLabel = getCourseLabel(segment)
  const levelLabel = getLevelLabel(segment)

  // Get contractId from selected level
  const selectedLevel = levels.find((l) => l.levelId === levelId)
  const contractId = selectedLevel?.contractId

  // Fetch contract details
  const { data: contractData, isLoading: isLoadingContract } = useQuery({
    ...useContractQueryOptions(contractId),
    enabled: !!contractId,
  })

  // Fetch scholarships
  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useQuery({
    ...useScholarshipsQueryOptions({ active: true, limit: 100 }),
  })

  const scholarships = useMemo(() => scholarshipsData?.data ?? [], [scholarshipsData?.data])

  // Calculate months remaining until academic period ends
  const maxInstallments = useMemo(() => {
    if (!selectedPeriod?.endDate || !contractData) return 12
    const endDate = new Date(String(selectedPeriod.endDate))
    const now = new Date()
    const monthsDiff =
      (endDate.getFullYear() - now.getFullYear()) * 12 +
      (endDate.getMonth() - now.getMonth())
    return Math.min(Math.max(monthsDiff, 1), contractData.installments)
  }, [selectedPeriod?.endDate, contractData])

  // Auto-select course if there's only one
  const hasOnlyOneCourse = courses.length === 1
  useEffect(() => {
    if (hasOnlyOneCourse && !courseId) {
      form.setValue('billing.courseId', courses[0].courseId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOnlyOneCourse, courseId, courses])

  // Auto-fill form when contract is loaded
  useEffect(() => {
    if (contractData) {
      form.setValue('billing.contractId', contractData.id)
      form.setValue('billing.monthlyFee', contractData.amount)
      form.setValue('billing.enrollmentFee', contractData.enrollmentValue ?? 0)
      form.setValue(
        'billing.installments',
        contractData.flexibleInstallments ? maxInstallments : contractData.installments
      )
      form.setValue('billing.enrollmentInstallments', contractData.enrollmentValueInstallments)
      form.setValue('billing.flexibleInstallments', contractData.flexibleInstallments)
    } else if (levelId && !contractId) {
      // Level selected but no contract - clear contract fields
      form.setValue('billing.contractId', null)
      form.setValue('billing.monthlyFee', 0)
      form.setValue('billing.enrollmentFee', 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractData?.id, contractId, levelId])

  // Handle scholarship selection
  const handleScholarshipChange = (
    scholarshipId: string | null,
    scholarship: { discountPercentage: number; enrollmentDiscountPercentage: number } | null
  ) => {
    form.setValue('billing.scholarshipId', scholarshipId)
    form.setValue('billing.discountPercentage', scholarship?.discountPercentage ?? 0)
    form.setValue(
      'billing.enrollmentDiscountPercentage',
      scholarship?.enrollmentDiscountPercentage ?? 0
    )
  }

  const selectedScholarshipId = form.watch('billing.scholarshipId')
  const discountPercentage = form.watch('billing.discountPercentage') ?? 0
  const enrollmentDiscountPercentage = form.watch('billing.enrollmentDiscountPercentage') ?? 0

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Acadêmicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Only show course selector if there's more than one course */}
          {!hasOnlyOneCourse && (
            <FormField
              control={form.control}
              name="billing.courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{courseLabel}*</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue('billing.levelId', '')
                      form.setValue('billing.classId', '')
                      form.setValue('billing.contractId', null)
                      form.setValue('billing.scholarshipId', null)
                    }}
                    value={field.value}
                    disabled={!academicPeriodId || isLoadingCourses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !academicPeriodId
                              ? 'Selecione o período letivo primeiro'
                              : isLoadingCourses
                                ? 'Carregando...'
                                : `Selecione o ${courseLabel.toLowerCase()}`
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="billing.levelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{levelLabel}*</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    form.setValue('billing.classId', '')
                    form.setValue('billing.scholarshipId', null)
                    form.setValue('billing.discountPercentage', 0)
                    form.setValue('billing.enrollmentDiscountPercentage', 0)
                  }}
                  value={field.value}
                  disabled={!courseId || isLoadingCourses}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !academicPeriodId
                            ? 'Selecione o período letivo primeiro'
                            : isLoadingCourses
                              ? 'Carregando...'
                              : `Selecione o ${levelLabel.toLowerCase()}`
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.levelId} value={level.levelId}>
                        {level.name}
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
            name="billing.classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turma</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={!levelId || isLoadingClasses}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !levelId
                            ? `Selecione o ${levelLabel.toLowerCase()} primeiro`
                            : isLoadingClasses
                              ? 'Carregando...'
                              : 'Selecione a turma (opcional)'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Contract Loading State */}
      {levelId && isLoadingContract && (
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Details */}
      {contractData && (
        <ContractDetailsCard
          name={contractData.name}
          enrollmentValue={contractData.enrollmentValue}
          monthlyFee={contractData.amount}
          installments={contractData.installments}
          enrollmentInstallments={contractData.enrollmentValueInstallments}
          paymentType={contractData.paymentType}
        />
      )}

      {/* Scholarship Selection */}
      {contractData && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <ScholarshipSelector
              scholarships={scholarships}
              value={selectedScholarshipId ?? null}
              onChange={handleScholarshipChange}
              isLoading={isLoadingScholarships}
            />

            {(discountPercentage > 0 || enrollmentDiscountPercentage > 0) && (
              <DiscountComparison
                originalEnrollmentFee={contractData.enrollmentValue ?? 0}
                originalMonthlyFee={contractData.amount}
                enrollmentDiscountPercentage={enrollmentDiscountPercentage}
                monthlyDiscountPercentage={discountPercentage}
                installments={contractData.paymentType === 'MONTHLY' ? 12 : form.watch('billing.installments')}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Info - Only show if contract exists */}
      {contractData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="billing.paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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

            <div className={contractData.paymentType === 'UPFRONT' ? 'grid grid-cols-2 gap-4' : ''}>
              <FormField
                control={form.control}
                name="billing.paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento*</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(contractData.paymentDays?.length
                          ? contractData.paymentDays.map((pd: { day: number }) => pd.day).sort((a: number, b: number) => a - b)
                          : [5, 10, 15, 20]
                        ).map((day: number) => (
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

              {contractData.paymentType === 'UPFRONT' && (
                <FormField
                  control={form.control}
                  name="billing.installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas*</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                        disabled={!contractData.flexibleInstallments}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from(
                            { length: contractData.flexibleInstallments ? maxInstallments : 1 },
                            (_, i) =>
                              contractData.flexibleInstallments ? i + 1 : contractData.installments
                          ).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!contractData.flexibleInstallments && (
                        <p className="text-xs text-muted-foreground">
                          Parcelas fixas definidas no contrato
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Documents */}
      {contractData?.contractDocuments && contractData.contractDocuments.length > 0 && (
        <RequiredDocumentsList documents={contractData.contractDocuments} />
      )}
    </div>
  )
}
