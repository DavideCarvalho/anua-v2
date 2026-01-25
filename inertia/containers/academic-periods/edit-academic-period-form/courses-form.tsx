import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, BookOpen } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

import { CourseLevels } from './course-levels'
import type { EditAcademicPeriodFormValues } from '../schemas/edit_academic_period.schema'

export function CoursesForm() {
  const form = useFormContext<EditAcademicPeriodFormValues>()
  const { fields, remove } = useFieldArray({
    control: form.control,
    name: 'courses',
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cursos e Níveis</CardTitle>
          <CardDescription>
            Gerencie os cursos e seus níveis (séries) vinculados a este período letivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                Nenhum curso vinculado a este período.
              </p>
              <p className="text-sm text-muted-foreground">
                Cursos são vinculados na criação do período letivo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">{field.name}</CardTitle>
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
