import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { api } from '~/lib/api'
import { getCourseLabel, getLevelLabel } from '~/lib/formatters'
import { ContractDetailsCard, RequiredDocumentsList } from '~/components/enrollment'
import type { AcademicPeriodSegment } from '~/lib/formatters'
import type { EnrollmentFormData, PaymentMethod } from '../schema'

const PaymentMethodLabels: Record<PaymentMethod, string> = {
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de Crédito',
  PIX: 'PIX',
}

const BenefitModeLabels = {
  NONE: 'Sem benefício',
  SCHOLARSHIP: 'Bolsa',
  INDIVIDUAL: 'Desconto individual',
}

export function BillingStep() {
  const form = useFormContext<EnrollmentFormData>()

  const academicPeriodId = form.watch('billing.academicPeriodId')
  const courseId = form.watch('billing.courseId')
  const levelId = form.watch('billing.levelId')

  const { data: academicPeriodsData } = useQuery(
    api.api.v1.academicPeriods.listAcademicPeriods.queryOptions({ query: { limit: 50 } })
  )

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    ...api.api.v1.academicPeriods.listCourses.queryOptions({
      params: { id: academicPeriodId! },
    }),
    enabled: !!academicPeriodId,
  })

  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    ...api.api.v1.classes.index.queryOptions({
      query: { levelId, academicPeriodId, limit: 50 },
    }),
    enabled: !!levelId && !!academicPeriodId,
  })

  const academicPeriods = academicPeriodsData?.data ?? []
  const courses = coursesData ?? []
  const selectedPeriod = academicPeriods.find((p) => p.id === academicPeriodId)
  const segment = (selectedPeriod?.segment ?? 'ELEMENTARY') as AcademicPeriodSegment
  const selectedCourse = courses.find((c) => c.courseId === courseId)
  const levels = selectedCourse?.levels ?? []
  const classes = classesData?.data ?? []
  const selectedLevel = levels.find((l) => l.levelId === levelId)
  const selectedClass = classes.find((c) => c.id === form.watch('billing.classId'))

  const courseLabel = getCourseLabel(segment)
  const levelLabel = getLevelLabel(segment)

  const contractId = selectedLevel?.contractId

  const { data: contractData, isLoading: isLoadingContract } = useQuery({
    ...api.api.v1.contracts.show.queryOptions({ params: { id: contractId! } }),
    enabled: !!contractId,
  })

  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useQuery({
    ...api.api.v1.scholarships.listScholarships.queryOptions({
      query: { active: true, limit: 100 },
    }),
  })

  const scholarships = useMemo(() => scholarshipsData?.data ?? [], [scholarshipsData?.data])

  const maxInstallments = useMemo(() => {
    if (!selectedPeriod?.endDate || !contractData) return 12
    const endDate = new Date(String(selectedPeriod.endDate))
    const now = new Date()
    const monthsDiff =
      (endDate.getFullYear() - now.getFullYear()) * 12 + (endDate.getMonth() - now.getMonth())
    return Math.min(Math.max(monthsDiff, 1), contractData.installments)
  }, [selectedPeriod?.endDate, contractData])

  const hasOnlyOneCourse = courses.length === 1
  useEffect(() => {
    if (hasOnlyOneCourse && !courseId) {
      form.setValue('billing.courseId', courses[0].courseId)
    }
  }, [hasOnlyOneCourse, courseId, courses])

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
      form.setValue('billing.contractId', null)
      form.setValue('billing.monthlyFee', 0)
      form.setValue('billing.enrollmentFee', 0)
    }
  }, [contractData?.id, contractId, levelId])

  const benefitMode = form.watch('billing.benefitMode') ?? 'NONE'
  const selectedScholarshipId = form.watch('billing.scholarshipId')
  const discountPercentage = form.watch('billing.discountPercentage') ?? 0
  const _enrollmentDiscountPercentage = form.watch('billing.enrollmentDiscountPercentage') ?? 0
  const individualDiscounts = form.watch('billing.individualDiscounts') ?? []
  const individualDiscount = individualDiscounts[0]
  const individualDiscountType = individualDiscount?.discountType ?? 'PERCENTAGE'
  const individualDiscountPercentage = individualDiscount?.discountPercentage ?? 0
  const individualDiscountValueReais = individualDiscount?.discountValue
    ? Number(individualDiscount.discountValue) / 100
    : 0

  const handleBenefitModeChange = (mode: 'NONE' | 'SCHOLARSHIP' | 'INDIVIDUAL') => {
    form.setValue('billing.benefitMode', mode)

    if (mode !== 'SCHOLARSHIP') {
      form.setValue('billing.scholarshipId', null)
      form.setValue('billing.discountPercentage', 0)
      form.setValue('billing.enrollmentDiscountPercentage', 0)
    }

    if (mode !== 'INDIVIDUAL') {
      form.setValue('billing.individualDiscounts', [])
    }
  }

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

  const updateIndividualDiscount = (
    updates: Partial<{
      name: string
      discountType: 'PERCENTAGE' | 'FLAT'
      discountPercentage: number
      discountValue: number
    }>
  ) => {
    const current = individualDiscounts[0] ?? {
      name: 'Desconto personalizado',
      discountType: 'PERCENTAGE' as const,
      discountPercentage: 0,
      discountValue: 0,
    }

    const updated = { ...current, ...updates }
    form.setValue('billing.individualDiscounts', [updated])
  }

  const benefitImpact = useMemo(() => {
    if (!contractData || benefitMode === 'NONE') return null

    const baseAmount = contractData.amount
    let discountAmount = 0
    let discountDescription = ''

    if (benefitMode === 'SCHOLARSHIP') {
      discountAmount = Math.round(baseAmount * (discountPercentage / 100))
      discountDescription = `${discountPercentage}% (bolsa)`
    }

    if (benefitMode === 'INDIVIDUAL' && individualDiscountType === 'PERCENTAGE') {
      discountAmount = Math.round(baseAmount * (individualDiscountPercentage / 100))
      discountDescription = `${individualDiscountPercentage}% (desconto individual)`
    }

    if (benefitMode === 'INDIVIDUAL' && individualDiscountType === 'FLAT') {
      discountAmount = Math.round(individualDiscountValueReais * 100)
      discountDescription = `R$ ${individualDiscountValueReais.toFixed(2)} (desconto individual)`
    }

    const discountedAmount = Math.max(0, baseAmount - discountAmount)

    return {
      baseAmount,
      discountAmount,
      discountDescription,
      discountedAmount,
    }
  }, [
    contractData,
    benefitMode,
    discountPercentage,
    individualDiscountType,
    individualDiscountPercentage,
    individualDiscountValueReais,
  ])

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Acadêmicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                      handleBenefitModeChange('NONE')
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
                        >
                          {selectedCourse?.name}
                        </SelectValue>
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
                    handleBenefitModeChange('NONE')
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
                      >
                        {selectedLevel?.name}
                      </SelectValue>
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
                      >
                        {selectedClass?.name}
                      </SelectValue>
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

      {contractData && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <FormField
              control={form.control}
              name="billing.benefitMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefício</FormLabel>
                  <Select
                    value={field.value ?? 'NONE'}
                    onValueChange={(value: 'NONE' | 'SCHOLARSHIP' | 'INDIVIDUAL' | null) =>
                      handleBenefitModeChange(value!)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <span className="flex flex-1 text-left">
                          {BenefitModeLabels[field.value ?? 'NONE']}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">{BenefitModeLabels.NONE}</SelectItem>
                      <SelectItem value="SCHOLARSHIP">{BenefitModeLabels.SCHOLARSHIP}</SelectItem>
                      <SelectItem value="INDIVIDUAL">{BenefitModeLabels.INDIVIDUAL}</SelectItem>
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
              <>
                <Label>Bolsa</Label>
                <Select
                  value={selectedScholarshipId ?? ''}
                  onValueChange={(value) => {
                    const scholarship = scholarships.find((s) => s.id === value)
                    handleScholarshipChange(value || null, scholarship ?? null)
                  }}
                  disabled={isLoadingScholarships}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma bolsa">
                        {scholarships.find((s) => s.id === selectedScholarshipId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {scholarships.map((scholarship) => (
                      <SelectItem key={scholarship.id} value={scholarship.id}>
                        {scholarship.name} ({scholarship.discountPercentage}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {benefitMode === 'INDIVIDUAL' && (
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <Label>Tipo de Desconto</Label>
                  <Select
                    value={individualDiscountType}
                    onValueChange={(value: 'PERCENTAGE' | 'FLAT' | null) => {
                      updateIndividualDiscount({
                        discountType: value!,
                        discountPercentage: value === 'PERCENTAGE' ? 0 : undefined,
                        discountValue: value === 'FLAT' ? 0 : undefined,
                      })
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
                </div>

                {individualDiscountType === 'PERCENTAGE' && (
                  <div className="col-span-2">
                    <Label>Desconto na Mensalidade (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={individualDiscountPercentage}
                      onChange={(e) =>
                        updateIndividualDiscount({
                          discountPercentage: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}

                {individualDiscountType === 'FLAT' && (
                  <div className="col-span-2">
                    <Label>Desconto na Mensalidade (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={individualDiscountValueReais}
                      onChange={(e) =>
                        updateIndividualDiscount({
                          discountValue: Math.round(Number(e.target.value) * 100),
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {benefitImpact && (
              <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
                <p>
                  Valor base da mensalidade:{' '}
                  <span className="font-medium text-foreground">
                    R$ {(benefitImpact.baseAmount / 100).toFixed(2)}
                  </span>
                </p>
                <p>
                  Desconto aplicado:{' '}
                  <span className="font-medium text-foreground">
                    -R$ {(benefitImpact.discountAmount / 100).toFixed(2)}
                  </span>{' '}
                  <span className="text-muted-foreground">
                    ({benefitImpact.discountDescription})
                  </span>
                </p>
                <p>
                  Valor final:{' '}
                  <span className="font-medium text-foreground">
                    R$ {(benefitImpact.discountedAmount / 100).toFixed(2)}
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
      )}

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
                        <SelectValue placeholder="Selecione">
                          {PaymentMethodLabels[field.value as PaymentMethod]}
                        </SelectValue>
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
                          ? contractData.paymentDays
                              .map((pd: { day: number }) => pd.day)
                              .sort((a: number, b: number) => a - b)
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

      {contractData?.contractDocuments && contractData.contractDocuments.length > 0 && (
        <RequiredDocumentsList documents={contractData.contractDocuments} />
      )}
    </div>
  )
}
