import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use_academic_periods'
import { useAcademicPeriodCoursesQueryOptions } from '~/hooks/queries/use_academic_period_courses'
import { useClassesQueryOptions } from '~/hooks/queries/use_classes'
import { getCourseLabel, getLevelLabel } from '~/lib/formatters'
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

  const { data: academicPeriodsData, isLoading: isLoadingPeriods } = useQuery(
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

  // Auto-select course if there's only one
  const hasOnlyOneCourse = courses.length === 1
  useEffect(() => {
    if (hasOnlyOneCourse && !courseId) {
      form.setValue('billing.courseId', courses[0].courseId)
    }
  }, [hasOnlyOneCourse, courseId, courses, form])

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Acadêmicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="billing.academicPeriodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período Letivo*</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    form.setValue('billing.courseId', '')
                    form.setValue('billing.levelId', '')
                    form.setValue('billing.classId', '')
                  }}
                  value={field.value}
                  disabled={isLoadingPeriods}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={isLoadingPeriods ? 'Carregando...' : 'Selecione o período letivo'}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {academicPeriods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billing.monthlyFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensalidade (R$)*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0.00"
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
              name="billing.discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desconto (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billing.paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia de Vencimento*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="5"
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
              name="billing.installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas*</FormLabel>
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
    </div>
  )
}
