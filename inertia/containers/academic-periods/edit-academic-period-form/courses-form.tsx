import { useFormContext, useFieldArray } from 'react-hook-form'
import { Trash2, BookOpen } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

import { CourseLevels } from './course-levels'
import type { EditAcademicPeriodFormValues } from '../schemas/edit_academic_period.schema'

function getCoursesTitle(segment: EditAcademicPeriodFormValues['calendar']['segment']) {
  if (segment === 'TECHNICAL' || segment === 'UNIVERSITY') {
    return 'Cursos e Semestres'
  }

  if (segment === 'KINDERGARTEN' || segment === 'ELEMENTARY' || segment === 'HIGHSCHOOL') {
    return 'Séries e Turmas'
  }

  return 'Cursos e Níveis'
}

function getCoursesDescription(segment: EditAcademicPeriodFormValues['calendar']['segment']) {
  if (segment === 'TECHNICAL' || segment === 'UNIVERSITY') {
    return 'Gerencie os cursos e semestres vinculados a este período letivo'
  }

  if (segment === 'KINDERGARTEN' || segment === 'ELEMENTARY' || segment === 'HIGHSCHOOL') {
    return 'Gerencie anos/séries e turmas vinculados a este período letivo'
  }

  return 'Gerencie os cursos e seus níveis vinculados a este período letivo'
}

export function CoursesForm() {
  const form = useFormContext<EditAcademicPeriodFormValues>()
  const segment = form.watch('calendar.segment')
  const coursesTitle = getCoursesTitle(segment)
  const coursesDescription = getCoursesDescription(segment)
  const { fields, remove } = useFieldArray({
    control: form.control,
    name: 'courses',
  })

  return (
    <div className="space-y-6 overflow-x-hidden">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{coursesTitle}</CardTitle>
          <CardDescription>{coursesDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Nenhum curso vinculado a este período.</p>
              <p className="text-sm text-muted-foreground">
                Cursos são vinculados na criação do período letivo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-dashed overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base break-words">{field.name}</CardTitle>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CourseLevels courseIndex={index} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
