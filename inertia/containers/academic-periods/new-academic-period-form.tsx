'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from '@adonisjs/inertia/react'

import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Stepper } from '~/components/ui/stepper'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

import { CalendarForm } from './components/calendar-form'
import { CoursesForm } from './components/courses-form'

import { SubPeriodsConfigForm } from './components/sub-periods-config-form'

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
  calendar: z
    .object({
      name: z.string().min(1, 'Nome é obrigatório'),
      startDate: z.date({ error: 'Data de início é obrigatória' }),
      endDate: z.date({ error: 'Data de término é obrigatória' }),
      segment: segmentEnum,
      holidays: z.array(z.date()).optional().default([]),
      weekendDaysWithClasses: z.array(z.date()).optional().default([]),
      enrollmentStartDate: z.date().nullable().optional(),
      enrollmentEndDate: z.date().nullable().optional(),
      periodStructure: z.enum(['', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL']).optional(),
      recoveryGradeMethod: z.enum(['', 'AVERAGE', 'REPLACE_IF_HIGHER', 'REPLACE']).optional(),
      breakStartDate: z.date().nullable().optional(),
      breakEndDate: z.date().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      const { startDate, endDate, breakStartDate, breakEndDate } = data

      if (breakStartDate && startDate && endDate) {
        if (breakStartDate < startDate || breakStartDate > endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Deve estar entre o início e o término do período letivo',
            path: ['breakStartDate'],
          })
        }
      }

      if (breakEndDate && startDate && endDate) {
        if (breakEndDate < startDate || breakEndDate > endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Deve estar entre o início e o término do período letivo',
            path: ['breakEndDate'],
          })
        }

        if (breakStartDate && breakEndDate <= breakStartDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'O término das férias deve ser após o início',
            path: ['breakEndDate'],
          })
        }
      }
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
                teachers: z
                  .array(
                    z.object({
                      teacherId: z.string(),
                      subjectId: z.string(),
                      subjectQuantity: z.number(),
                    })
                  )
                  .optional()
                  .default([]),
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
type AcademicPeriodFormInput = z.input<typeof schema>

const steps = [
  {
    title: 'Calendário',
    description: 'Defina o período letivo',
  },
  {
    title: 'Sub-Períodos',
    description: 'Estrutura de bimestres/trimestres',
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
  const queryClient = useQueryClient()
  const createMutation = useMutation(
    api.api.v1.academicPeriods.createAcademicPeriod.mutationOptions()
  )

  const form = useForm<AcademicPeriodFormInput, undefined, AcademicPeriodFormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      schoolId,
      previousPeriodId: null,
      calendar: {
        name: '',
        startDate: undefined,
        endDate: undefined,
        segment: 'ELEMENTARY',
        holidays: [],
        weekendDaysWithClasses: [],
        enrollmentStartDate: null,
        enrollmentEndDate: null,
        periodStructure: '',
        recoveryGradeMethod: '',
        breakStartDate: null,
        breakEndDate: null,
      },
      courses: [],
    },
  })

  const handleNext = async () => {
    if (currentStep === 0) {
      const isValid = await form.trigger([
        'calendar.name',
        'calendar.startDate',
        'calendar.endDate',
        'calendar.segment',
      ])
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
        body: {
          schoolId: values.schoolId,
          name: values.calendar.name,
          startDate: values.calendar.startDate.toISOString(),
          endDate: values.calendar.endDate.toISOString(),
          segment: values.calendar.segment,
          periodStructure: values.calendar.periodStructure || null,
          recoveryGradeMethod: values.calendar.recoveryGradeMethod || null,
          breakStartDate: values.calendar.breakStartDate?.toISOString() ?? null,
          breakEndDate: values.calendar.breakEndDate?.toISOString() ?? null,
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
        },
      })
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
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
              {currentStep === 1 && <SubPeriodsConfigForm />}
              {currentStep === 2 && <CoursesForm />}

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
