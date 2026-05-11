import { useState, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, ChevronLeft, ChevronRight, Save } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { api } from '~/lib/api'

import { Stepper } from './stepper'
import { CalendarForm } from './calendar-form'
import { CoursesForm } from './courses-form'
import { SubPeriodsForm } from './sub-periods-form'
import {
  editAcademicPeriodSchema,
  type EditAcademicPeriodFormValues,
  type Segment,
} from '../schemas/edit_academic_period.schema'

function getSteps(segment: string) {
  const isCourseBased = segment === 'TECHNICAL' || segment === 'UNIVERSITY'
  return [
    { title: 'Calendário', description: 'Datas e informações' },
    { title: 'Sub-Períodos', description: 'Bimestres, trimestres ou semestres' },
    {
      title: isCourseBased ? 'Cursos' : 'Séries',
      description: isCourseBased ? 'Cursos e semestres' : 'Séries e turmas',
    },
  ]
}

export interface AcademicPeriodData {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  enrollmentStartDate: string | null
  enrollmentEndDate: string | null
  isActive: boolean
  isClosed: boolean
  segment: string
  periodStructure?: string | null
  recoveryGradeMethod?: string | null
  breakStartDate?: string | null
  breakEndDate?: string | null
  courses?: Array<{
    id: string
    courseId: string
    name: string
    levels: Array<{
      id: string
      levelId: string
      name: string
      order: number
      contractId: string | null
      isActive: boolean
      classes?: Array<{
        id: string
        name: string
        teachers?: Array<{
          id: string
          teacherId: string
          teacherName: string
          subjectId: string
          subjectName: string
          subjectQuantity: number
        }>
      }>
    }>
  }>
}

interface EditAcademicPeriodFormProps {
  academicPeriod: AcademicPeriodData
}

export function EditAcademicPeriodForm({ academicPeriod }: EditAcademicPeriodFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const queryClient = useQueryClient()
  const steps = getSteps(academicPeriod.segment)

  const form = useForm<
    z.input<typeof editAcademicPeriodSchema>,
    undefined,
    EditAcademicPeriodFormValues
  >({
    resolver: zodResolver(editAcademicPeriodSchema),
    mode: 'onBlur',
    defaultValues: {
      calendar: {
        name: academicPeriod.name,
        segment: academicPeriod.segment as Segment,
        startDate: new Date(academicPeriod.startDate),
        endDate: new Date(academicPeriod.endDate),
        enrollmentStartDate: academicPeriod.enrollmentStartDate
          ? new Date(academicPeriod.enrollmentStartDate)
          : null,
        enrollmentEndDate: academicPeriod.enrollmentEndDate
          ? new Date(academicPeriod.enrollmentEndDate)
          : null,
        periodStructure: (academicPeriod.periodStructure ?? '') as
          | ''
          | 'BIMESTRAL'
          | 'TRIMESTRAL'
          | 'SEMESTRAL'
          | 'ANUAL'
          | undefined,
        recoveryGradeMethod: (academicPeriod.recoveryGradeMethod ?? '') as
          | ''
          | 'AVERAGE'
          | 'REPLACE_IF_HIGHER'
          | 'REPLACE'
          | undefined,
        breakStartDate: academicPeriod.breakStartDate
          ? new Date(academicPeriod.breakStartDate)
          : null,
        breakEndDate: academicPeriod.breakEndDate ? new Date(academicPeriod.breakEndDate) : null,
      },
      courses: academicPeriod.courses ?? [],
    },
  })

  const updateAcademicPeriodMutation = useMutation(
    api.api.v1.academicPeriods.updateAcademicPeriod.mutationOptions()
  )
  const updatePeriodMutation = useMutation({
    mutationFn: async (payload: { data: EditAcademicPeriodFormValues; subPeriods?: Record<string, unknown>[] }) => {
      await updateAcademicPeriodMutation.mutateAsync({
        params: { id: academicPeriod.id },
        body: {
          name: payload.data.calendar.name,
          segment: payload.data.calendar.segment,
          startDate: payload.data.calendar.startDate.toISOString(),
          endDate: payload.data.calendar.endDate.toISOString(),
          enrollmentStartDate: payload.data.calendar.enrollmentStartDate?.toISOString(),
          enrollmentEndDate: payload.data.calendar.enrollmentEndDate?.toISOString(),
          periodStructure: payload.data.calendar.periodStructure || null,
          recoveryGradeMethod: payload.data.calendar.recoveryGradeMethod || null,
          breakStartDate: payload.data.calendar.breakStartDate?.toISOString() ?? null,
          breakEndDate: payload.data.calendar.breakEndDate?.toISOString() ?? null,
          subPeriods: payload.subPeriods,
          courses: payload.data.courses.map((course) => ({
            id: course.id,
            courseId: course.courseId,
            levels: course.levels.map((level) => ({
              id: level.id,
              levelId: level.levelId ?? '',
              name: level.name,
              order: level.order,
              contractId: level.contractId ?? undefined,
              isActive: level.isActive,
              classes: level.classes?.map((cls) => ({
                id: cls.id,
                name: cls.name,
                teachers: cls.teachers?.map((t) => ({
                  id: t.id,
                  teacherId: t.teacherId,
                  subjectId: t.subjectId,
                  subjectQuantity: t.subjectQuantity,
                })),
              })),
            })),
          })),
        },
      })
    },
    onSuccess: () => {
      const currentValues = form.getValues()
      const activeOnlyCourses = currentValues.courses.map((course) => ({
        ...course,
        levels: course.levels
          .filter((level) => level.isActive)
          .map((level, index) => ({
            ...level,
            order: index,
          })),
      }))

      form.reset({
        ...currentValues,
        courses: activeOnlyCourses,
      })

      toast.success('Período letivo atualizado com sucesso')
      queryClient.invalidateQueries({ queryKey: ['academic-period'] })
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar período letivo')
    },
  })

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentStep === 0) {
      const valid = await form.trigger('calendar')
      if (!valid) return
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex === currentStep) return

    if (stepIndex > currentStep && currentStep === 0) {
      const valid = await form.trigger('calendar')
      if (!valid) return
    }

    setCurrentStep(stepIndex)
  }

  const saveSubPeriodsRef = useRef<(() => Record<string, unknown>[] | null) | null>(null)

  const handleSubmit = form.handleSubmit(async (data) => {
    const mismatch = form.formState.errors.root?.subPeriodMismatch
    if (mismatch) {
      toast.error(mismatch.message as string)
      return
    }
    const subPeriods = saveSubPeriodsRef.current?.()
    updatePeriodMutation.mutate({ data, subPeriods: subPeriods ?? undefined })
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Stepper steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

        <div className="min-h-[400px] overflow-x-hidden">
          {currentStep === 0 && <CalendarForm />}
          {currentStep === 1 && (
            <SubPeriodsForm
              academicPeriodId={academicPeriod.id}
              periodStructure={form.watch('calendar.periodStructure')}
              recoveryGradeMethod={form.watch('calendar.recoveryGradeMethod')}
              saveRef={saveSubPeriodsRef}
            />
          )}
          {currentStep === 2 && <CoursesForm />}
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 && (
              <Button type="button" onClick={handleNext}>
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <div className="flex flex-col items-end gap-1">
              {form.formState.errors.root?.subPeriodMismatch && (
                <p className="text-xs text-amber-600 max-w-[250px] text-right leading-tight">
                  {form.formState.errors.root.subPeriodMismatch.message}
                </p>
              )}
              <Button type="submit" disabled={updatePeriodMutation.isPending}>
                {updatePeriodMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
