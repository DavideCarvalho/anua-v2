'use client'

import { useEffect, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { useContractsQueryOptions } from '~/hooks/queries/use_contracts'

import type { AcademicPeriodFormValues } from '../new-academic-period-form'
import { SortableLevel } from './sortable-level'

type Segment = AcademicPeriodFormValues['calendar']['segment']

function getDefaultCourseName(segment: Segment): string {
  switch (segment) {
    case 'KINDERGARTEN':
      return 'Educação Infantil'
    case 'ELEMENTARY':
      return 'Ensino Fundamental'
    case 'HIGHSCHOOL':
      return 'Ensino Médio'
    case 'TECHNICAL':
      return 'Ensino Técnico'
    case 'UNIVERSITY':
      return 'Ensino Superior'
    default:
      return 'Período Letivo'
  }
}

function getDefaultLevels(
  segment: Segment
): Array<{ name: string; order: number; classes: never[]; contractId?: string }> {
  switch (segment) {
    case 'KINDERGARTEN':
      return [
        { name: 'Berçário', order: 0, classes: [] },
        { name: 'Maternal I', order: 1, classes: [] },
        { name: 'Maternal II', order: 2, classes: [] },
        { name: 'Jardim I', order: 3, classes: [] },
        { name: 'Jardim II', order: 4, classes: [] },
        { name: 'Pré I', order: 5, classes: [] },
        { name: 'Pré II', order: 6, classes: [] },
      ]
    case 'ELEMENTARY':
      return Array.from({ length: 9 }, (_, i) => ({
        name: `${i + 1}º Ano`,
        order: i,
        classes: [],
      }))
    case 'HIGHSCHOOL':
      return [
        { name: '1º Ano', order: 0, classes: [] },
        { name: '2º Ano', order: 1, classes: [] },
        { name: '3º Ano', order: 2, classes: [] },
      ]
    case 'TECHNICAL':
    case 'UNIVERSITY':
      return [
        { name: '1º Semestre', order: 0, classes: [] },
        { name: '2º Semestre', order: 1, classes: [] },
      ]
    default:
      return [{ name: '', order: 0, classes: [] }]
  }
}

function getLevelLabel(segment: Segment): string {
  switch (segment) {
    case 'KINDERGARTEN':
    case 'ELEMENTARY':
    case 'HIGHSCHOOL':
      return 'Ano'
    case 'TECHNICAL':
    case 'UNIVERSITY':
      return 'Semestre'
    default:
      return 'Nível'
  }
}

export function CoursesForm() {
  const form = useFormContext<AcademicPeriodFormValues>()
  const segment = form.watch('calendar.segment')
  const courses = form.watch('courses') || []
  const [lastDeletedLevel, setLastDeletedLevel] = useState<{
    courseIndex: number
    level: { name: string; order: number; classes: any[]; contractId?: string }
    levelIndex: number
  } | null>(null)

  const { data: contractsData } = useQuery(useContractsQueryOptions({ limit: 100 }))
  const contracts = contractsData?.data ?? []

  const {
    fields: courseFields,
    append: appendCourse,
    remove: removeCourse,
  } = useFieldArray({
    control: form.control,
    name: 'courses',
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Inicializar automaticamente um curso com níveis baseado no segmento
  useEffect(() => {
    if (courses.length === 0 && segment) {
      const defaultCourseName = getDefaultCourseName(segment)
      const defaultLevels = getDefaultLevels(segment)

      form.setValue('courses', [
        {
          name: defaultCourseName,
          order: 0,
          levels: defaultLevels,
        },
      ])
    }
  }, [segment, courses.length, form])

  const handleDragEnd = (event: DragEndEvent, courseIndex: number) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const levels = form.getValues(`courses.${courseIndex}.levels`)
      const oldIndex = levels.findIndex((_, i) => `level-${i}` === active.id)
      const newIndex = levels.findIndex((_, i) => `level-${i}` === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newLevels = [...levels]
        const [removed] = newLevels.splice(oldIndex, 1)
        newLevels.splice(newIndex, 0, removed)

        // Update order values
        newLevels.forEach((level, idx) => {
          level.order = idx
        })

        form.setValue(`courses.${courseIndex}.levels`, newLevels)
      }
    }
  }

  const addCourse = () => {
    appendCourse({
      name: '',
      order: courseFields.length,
      levels: [{ name: '', order: 0, classes: [] }],
    })
  }

  const addLevel = (courseIndex: number) => {
    const levels = form.getValues(`courses.${courseIndex}.levels`) || []
    form.setValue(`courses.${courseIndex}.levels`, [
      ...levels,
      { name: '', order: levels.length, classes: [] },
    ])
  }

  const removeLevel = (courseIndex: number, levelIndex: number) => {
    const levels = form.getValues(`courses.${courseIndex}.levels`) || []
    const levelToDelete = levels[levelIndex]

    if (!levelToDelete) return

    setLastDeletedLevel({
      courseIndex,
      level: levelToDelete,
      levelIndex,
    })

    const updatedLevels = levels
      .filter((_, idx) => idx !== levelIndex)
      .map((level, idx) => ({
        ...level,
        order: idx,
      }))

    form.setValue(`courses.${courseIndex}.levels`, updatedLevels)
  }

  const undoDeleteLevel = () => {
    if (!lastDeletedLevel) return

    const levels = form.getValues(`courses.${lastDeletedLevel.courseIndex}.levels`) || []
    const insertIndex = Math.min(lastDeletedLevel.levelIndex, levels.length)
    const restoredLevels = [...levels]

    restoredLevels.splice(insertIndex, 0, {
      ...lastDeletedLevel.level,
    })

    const reorderedLevels = restoredLevels.map((level, idx) => ({
      ...level,
      order: idx,
    }))

    form.setValue(`courses.${lastDeletedLevel.courseIndex}.levels`, reorderedLevels)
    setLastDeletedLevel(null)
  }

  const handleCreateContract = () => {
    toast.info('Funcionalidade de criar contrato ainda não implementada')
  }

  const canAddMultipleCourses = segment === 'TECHNICAL' || segment === 'UNIVERSITY'
  const levelLabel = getLevelLabel(segment)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">
            {canAddMultipleCourses ? 'Cursos e Semestres' : 'Séries / Anos'}
          </Label>
          <p className="text-sm text-muted-foreground">
            {canAddMultipleCourses
              ? 'Configure os cursos e semestres. Arraste para reordenar.'
              : 'Configure as séries e anos. Arraste para reordenar. Adicione turmas e vincule professores.'}
          </p>
        </div>
        {canAddMultipleCourses && (
          <Button type="button" onClick={addCourse} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Curso
          </Button>
        )}
      </div>

      {courseFields.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Carregando configuração...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courseFields.map((course, courseIndex) => {
            const levels = form.watch(`courses.${courseIndex}.levels`) || []

            return (
              <Card key={course.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`courses.${courseIndex}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>
                            {canAddMultipleCourses ? 'Nome do Curso' : 'Segmento'}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                canAddMultipleCourses
                                  ? 'Ex: Administração'
                                  : 'Ex: Ensino Fundamental'
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {canAddMultipleCourses && courseFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="mt-6"
                        onClick={() => removeCourse(courseIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{levelLabel}s</Label>
                      <div className="flex items-center gap-2">
                        {lastDeletedLevel?.courseIndex === courseIndex && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={undoDeleteLevel}
                          >
                            Desfazer exclusão
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addLevel(courseIndex)}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Adicionar {levelLabel}
                        </Button>
                      </div>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, courseIndex)}
                    >
                      <SortableContext
                        items={levels.map((_, index) => `level-${index}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {levels.map((_level, levelIndex) => (
                            <SortableLevel
                              key={`level-${levelIndex}`}
                              id={`level-${levelIndex}`}
                              index={levelIndex}
                              courseIndex={courseIndex}
                              contracts={contracts}
                              onCreateContract={handleCreateContract}
                              onDeleteLevel={() => removeLevel(courseIndex, levelIndex)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
