'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { router } from '@inertiajs/react'

import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Stepper } from '~/components/ui/stepper'

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
    startDate: z.date({ required_error: 'Data de início é obrigatória' }),
    endDate: z.date({ required_error: 'Data de término é obrigatória' }),
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
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AcademicPeriodFormValues>({
    resolver: zodResolver(schema),
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
    setIsSubmitting(true)
    try {
      // 1. Create AcademicPeriod
      const response = await fetch('/api/v1/academic-periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: values.schoolId,
          name: values.calendar.name,
          startDate: values.calendar.startDate.toISOString(),
          endDate: values.calendar.endDate.toISOString(),
          segment: values.calendar.segment,
          enrollmentStartDate: values.calendar.enrollmentStartDate?.toISOString(),
          enrollmentEndDate: values.calendar.enrollmentEndDate?.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erro ao criar período letivo')
      }

      const academicPeriod = await response.json()

      // 2. Create courses and levels if any
      if (values.courses.length > 0) {
        for (const course of values.courses) {
          // 2a. Create Course
          const courseResponse = await fetch('/api/v1/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: course.name,
              order: course.order,
              schoolId: values.schoolId,
            }),
          })

          if (!courseResponse.ok) {
            console.error('Error creating course:', course.name)
            continue
          }

          const createdCourse = await courseResponse.json()

          // 2b. Create CourseHasAcademicPeriod (link course to academic period)
          const courseHasAcademicPeriodResponse = await fetch('/api/v1/course-has-academic-periods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: createdCourse.id,
              academicPeriodId: academicPeriod.id,
            }),
          })

          if (!courseHasAcademicPeriodResponse.ok) {
            console.error('Error linking course to academic period:', course.name)
            continue
          }

          const courseHasAcademicPeriod = await courseHasAcademicPeriodResponse.json()

          // 2c. Create levels for this course
          for (const level of course.levels) {
            // Create Level (with schoolId)
            const levelResponse = await fetch('/api/v1/levels', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: level.name,
                order: level.order,
                schoolId: values.schoolId,
              }),
            })

            if (!levelResponse.ok) {
              console.error('Error creating level:', level.name)
              continue
            }

            const createdLevel = await levelResponse.json()

            // Create LevelAssignedToCourseHasAcademicPeriod (link level to courseHasAcademicPeriod)
            await fetch('/api/v1/level-assignments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                levelId: createdLevel.id,
                courseHasAcademicPeriodId: courseHasAcademicPeriod.id,
                isActive: true,
              }),
            })
          }
        }
      }

      toast.success('Período letivo criado com sucesso!')
      onSuccess?.()
      router.visit('/escola/administrativo/periodos-letivos')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar período letivo')
      console.error(error)
    } finally {
      setIsSubmitting(false)
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
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Criando...' : 'Criar Período Letivo'}
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
