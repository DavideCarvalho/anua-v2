'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from '@tuyau/inertia/react'

import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Stepper } from '~/components/ui/stepper'
import { useCreateAcademicPeriodMutation } from '~/hooks/mutations/use_create_academic_period'

import { CalendarForm } from './components/calendar-form'
import { CoursesForm } from './components/courses-form'

const segmentEnum = z.enum([
  'KINDERGARTEN',
  'ELEMENTARY',
  'HIGHSCHOOL',
  'TECHNICAL',
  'UNIVERSITY',
  'OTHER',
])

const schema = z.object({
  schoolId: z.string(),
  previousPeriodId: z.string().nullable().optional(),
  calendar: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    startDate: z.date({ error: 'Data de início é obrigatória' }),
    endDate: z.date({ error: 'Data de término é obrigatória' }),
    segment: segmentEnum,
    holidays: z.array(z.date()).optional().default([]),
    weekendDaysWithClasses: z.array(z.date()).optional().default([]),
    enrollmentStartDate: z.date().nullable().optional(),
    enrollmentEndDate: z.date().nullable().optional(),
  }),
  courses: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Nome do curso é obrigatório'),
      order: z.number(),
      levels: z.array(
        z.object({
          id: z.string().optional(),
          name: z.string().min(1, 'Nome da série é obrigatório'),
          order: z.number(),
          contractId: z.string().optional(),
          classes: z
            .array(
              z.object({
                id: z.string().optional(),
                name: z.string(),
                teachers: z.array(
                  z.object({
                    teacherId: z.string(),
                    subjectId: z.string(),
                    subjectQuantity: z.number(),
                  })
                ).optional().default([]),
              })
            )
            .optional()
            .default([]),
        })
      ),
    })
  ),
})

export type AcademicPeriodFormValues = z.infer<typeof schema>

const steps = [
  {
    title: 'Calendário',
    description: 'Defina o período letivo',
  },
  {
    title: 'Cursos e Séries',
    description: 'Configure a estrutura acadêmica',
  },
]

interface NewAcademicPeriodFormProps {
  schoolId: string
  onSuccess?: () => void
}

export function NewAcademicPeriodForm({ schoolId, onSuccess }: NewAcademicPeriodFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const createMutation = useCreateAcademicPeriodMutation()

  const form = useForm<AcademicPeriodFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      schoolId,
      previousPeriodId: null,
      calendar: {
        name: '',
        startDate: undefined as unknown as Date,
        endDate: undefined as unknown as Date,
        segment: 'ELEMENTARY',
        holidays: [],
        weekendDaysWithClasses: [],
        enrollmentStartDate: null,
        enrollmentEndDate: null,
      },
      courses: [],
    },
  })

  const handleNext = async () => {
    if (currentStep === 0) {
      const isValid = await form.trigger(['calendar.name', 'calendar.startDate', 'calendar.endDate', 'calendar.segment'])
      if (!isValid) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (values: AcademicPeriodFormValues) => {
    try {
      await createMutation.mutateAsync({
        schoolId: values.schoolId,
        name: values.calendar.name,
        startDate: values.calendar.startDate.toISOString(),
        endDate: values.calendar.endDate.toISOString(),
        segment: values.calendar.segment,
        enrollmentStartDate: values.calendar.enrollmentStartDate?.toISOString(),
        enrollmentEndDate: values.calendar.enrollmentEndDate?.toISOString(),
        courses: values.courses.map((course) => ({
          courseId: course.id,
          name: course.name,
          levels: course.levels.map((level) => ({
            levelId: level.id,
            name: level.name,
            order: level.order,
            contractId: level.contractId,
            classes: level.classes.map((cls) => ({
              name: cls.name,
              teachers: cls.teachers,
            })),
          })),
        })),
      })

      toast.success('Período letivo criado com sucesso!')
      onSuccess?.()
      router.visit({ route: 'web.escola.periodosLetivos' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar período letivo')
      console.error(error)
    }
  }

  return (
    <div className="space-y-8">
      <Stepper steps={steps} currentStep={currentStep} />

      <Card>
        <CardContent className="pt-6">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              {currentStep === 0 && <CalendarForm />}
              {currentStep === 1 && <CoursesForm />}

              <div className="mt-8 flex justify-between">
                {currentStep > 0 && (
                  <Button type="button" onClick={handleBack} variant="outline">
                    Voltar
                  </Button>
                )}
                <div className="ml-auto flex gap-2">
                  {currentStep < steps.length - 1 && (
                    <Button type="button" onClick={handleNext}>
                      Próximo
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Criando...' : 'Criar Período Letivo'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}
