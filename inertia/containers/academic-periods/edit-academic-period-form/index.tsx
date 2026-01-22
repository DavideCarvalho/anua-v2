import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, ChevronLeft, ChevronRight, Save } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { tuyau } from '~/lib/api'

import { Stepper } from './stepper'
import { CalendarForm } from './calendar-form'
import { CoursesForm } from './courses-form'
import {
  editAcademicPeriodSchema,
  type EditAcademicPeriodFormValues,
  type Segment,
} from '../schemas/edit-academic-period.schema'

const STEPS = [
  { title: 'Calendário', description: 'Datas e informações' },
  { title: 'Cursos', description: 'Níveis e séries' },
]

interface AcademicPeriodData {
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
    }>
  }>
}

interface EditAcademicPeriodFormProps {
  academicPeriod: AcademicPeriodData
}

export function EditAcademicPeriodForm({ academicPeriod }: EditAcademicPeriodFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const queryClient = useQueryClient()

  const form = useForm<EditAcademicPeriodFormValues>({
    resolver: zodResolver(editAcademicPeriodSchema),
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
      },
      courses: academicPeriod.courses ?? [],
    },
  })

  const updatePeriodMutation = useMutation({
    mutationFn: async (data: EditAcademicPeriodFormValues) => {
      // Update basic period info
      await tuyau.api.v1['academic-periods'][':id'].$put({
        id: academicPeriod.id,
      }, {
        name: data.calendar.name,
        segment: data.calendar.segment,
        startDate: data.calendar.startDate.toISOString(),
        endDate: data.calendar.endDate.toISOString(),
        enrollmentStartDate: data.calendar.enrollmentStartDate?.toISOString(),
        enrollmentEndDate: data.calendar.enrollmentEndDate?.toISOString(),
      }).unwrap()

      // Update courses
      await tuyau.api.v1['academic-periods'][':id'].courses.$put({
        id: academicPeriod.id,
      }, {
        courses: data.courses.map((course) => ({
          id: course.id,
          courseId: course.courseId,
          levels: course.levels.map((level) => ({
            id: level.id,
            levelId: level.levelId,
            isActive: level.isActive,
          })),
        })),
      }).unwrap()
    },
    onSuccess: () => {
      toast.success('Período letivo atualizado com sucesso')
      queryClient.invalidateQueries({ queryKey: ['academic-period'] })
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar período letivo')
    },
  })

  const handleNext = async () => {
    if (currentStep === 0) {
      const valid = await form.trigger('calendar')
      if (!valid) return
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = form.handleSubmit((data) => {
    updatePeriodMutation.mutate(data)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Stepper steps={STEPS} currentStep={currentStep} />

        <div className="min-h-[400px]">
          {currentStep === 0 && <CalendarForm />}
          {currentStep === 1 && <CoursesForm />}
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
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={updatePeriodMutation.isPending}>
                {updatePeriodMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
