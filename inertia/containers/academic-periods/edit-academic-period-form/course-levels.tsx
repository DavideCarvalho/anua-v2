import { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Layers,
  Plus,
  MoreVertical,
  ChevronDown,
  Check,
  Trash2,
  Undo2,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { useContractsQueryOptions } from '~/hooks/queries/use_contracts'
import { useTeachersQueryOptions } from '~/hooks/queries/use_teachers'
import { useSubjectsQueryOptions } from '~/hooks/queries/use_subjects'
import type {
  EditAcademicPeriodFormValues,
  LevelFormValues,
  ClassFormValues,
} from '../schemas/edit_academic_period.schema'
import { EditClassModal } from './edit-class-modal'

interface CourseLevelsProps {
  courseIndex: number
}

function getLevelLabel(segment: string): string {
  if (segment === 'TECHNICAL' || segment === 'UNIVERSITY') {
    return 'Semestre'
  }

  if (segment === 'KINDERGARTEN' || segment === 'ELEMENTARY' || segment === 'HIGHSCHOOL') {
    return 'Ano'
  }

  return 'Nível'
}

function getDefaultLevelName(segment: string, levelCount: number): string {
  if (segment === 'TECHNICAL' || segment === 'UNIVERSITY') {
    return `${levelCount + 1}º Semestre`
  }

  if (segment === 'KINDERGARTEN' || segment === 'ELEMENTARY' || segment === 'HIGHSCHOOL') {
    return `${levelCount + 1}º Ano`
  }

  return `Nível ${levelCount + 1}`
}

interface SortableLevelItemProps {
  sortableId: string
  level: LevelFormValues
  courseIndex: number
  levelIndex: number
  contracts: Array<{ id: string; name: string }>
  teachers: Array<{ id: string; user: { name: string } }>
  subjects: Array<{ id: string; name: string }>
}

function SortableLevelItem({
  sortableId,
  level,
  courseIndex,
  levelIndex,
  contracts,
  teachers,
  subjects,
}: SortableLevelItemProps) {
  const form = useFormContext<EditAcademicPeriodFormValues>()
  const [showNewClassModal, setShowNewClassModal] = useState(false)
  const [editingClassIndex, setEditingClassIndex] = useState<number | null>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isActive = form.watch(`courses.${courseIndex}.levels.${levelIndex}.isActive`)
  const levelName = form.watch(`courses.${courseIndex}.levels.${levelIndex}.name`)
  const contractId = form.watch(`courses.${courseIndex}.levels.${levelIndex}.contractId`)
  const classes = form.watch(`courses.${courseIndex}.levels.${levelIndex}.classes`) || []
  const selectedContract = contracts.find((c) => c.id === contractId)

  const { append: appendClass, remove: removeClass } = useFieldArray({
    control: form.control,
    name: `courses.${courseIndex}.levels.${levelIndex}.classes`,
  })

  const handleSaveClass = (data: {
    name: string
    teachers: Array<{ teacherId: string; subjectId: string; subjectQuantity: number }>
  }) => {
    if (editingClassIndex !== null) {
      form.setValue(
        `courses.${courseIndex}.levels.${levelIndex}.classes.${editingClassIndex}`,
        data
      )
      setEditingClassIndex(null)
    } else {
      appendClass(data)
      setShowNewClassModal(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex flex-col gap-3 rounded-lg border bg-background p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {level.order + 1}
            </Badge>
            <Input
              value={levelName ?? ''}
              onChange={(event) => {
                form.setValue(
                  `courses.${courseIndex}.levels.${levelIndex}.name`,
                  event.target.value
                )
              }}
              placeholder="Nome do nível/série"
              className="h-8"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="max-w-full"
                disabled={!isActive}
              >
                <span className="max-w-[120px] truncate">
                  {selectedContract?.name || 'Contrato'}
                </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {contracts.map((contract) => (
                <DropdownMenuItem
                  key={contract.id}
                  onClick={() => {
                    form.setValue(
                      `courses.${courseIndex}.levels.${levelIndex}.contractId`,
                      contract.id
                    )
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{contract.name}</span>
                    {contractId === contract.id && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNewClassModal(true)}
            disabled={!isActive}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>

          {isActive ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir nível?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esse nível será marcado como inativo ao salvar o período letivo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      form.setValue(`courses.${courseIndex}.levels.${levelIndex}.isActive`, false)
                    }}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                form.setValue(`courses.${courseIndex}.levels.${levelIndex}.isActive`, true)
              }}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Desfazer exclusão
            </Button>
          )}
        </div>
      </div>

      {classes.length > 0 && (
        <div className="mt-2 space-y-2 lg:ml-12">
          {classes.map((classItem: ClassFormValues, classIndex: number) => (
            <div
              key={`class-${classIndex}`}
              className="flex flex-col gap-2 rounded border bg-muted/30 p-3 sm:flex-row sm:items-center"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium break-words">{classItem.name}</p>
                {classItem.teachers && classItem.teachers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {classItem.teachers.length} professor(es) vinculado(s)
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingClassIndex(classIndex)}
                disabled={!isActive}
              >
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" disabled={!isActive}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingClassIndex(classIndex)}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => removeClass(classIndex)}
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <EditClassModal
        open={showNewClassModal || editingClassIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewClassModal(false)
            setEditingClassIndex(null)
          }
        }}
        onSave={handleSaveClass}
        teachers={teachers}
        subjects={subjects}
        initialData={editingClassIndex !== null ? classes[editingClassIndex] : undefined}
      />
    </div>
  )
}

export function CourseLevels({ courseIndex }: CourseLevelsProps) {
  const form = useFormContext<EditAcademicPeriodFormValues>()
  const { fields, move, append } = useFieldArray({
    control: form.control,
    name: `courses.${courseIndex}.levels`,
    keyName: 'fieldKey',
  })
  const segment = form.watch('calendar.segment')
  const levelLabel = getLevelLabel(segment)

  const { data: contractsData } = useQuery(useContractsQueryOptions({ limit: 100 }))
  const { data: teachersData } = useQuery(useTeachersQueryOptions({ limit: 100 }))
  const { data: subjectsData } = useQuery(useSubjectsQueryOptions({ limit: 100 }))

  const contracts = contractsData?.data ?? []
  const teachers = teachersData?.data ?? []
  const subjects = subjectsData?.data ?? []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.fieldKey === active.id)
      const newIndex = fields.findIndex((field) => field.fieldKey === over.id)

      move(oldIndex, newIndex)

      // Update order values
      const newFields = arrayMove(fields, oldIndex, newIndex)
      newFields.forEach((_, index) => {
        form.setValue(`courses.${courseIndex}.levels.${index}.order`, index)
      })
    }
  }

  const handleAddLevel = () => {
    append({
      name: getDefaultLevelName(segment, fields.length),
      order: fields.length,
      contractId: null,
      isActive: true,
      classes: [],
    })
  }

  if (fields.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="h-4 w-4" />
          <span>Nenhum nível configurado</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddLevel}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar {levelLabel}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleAddLevel}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar {levelLabel}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={fields.map((field) => field.fieldKey)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {fields.map((field, index) => (
              <SortableLevelItem
                key={field.fieldKey}
                sortableId={field.fieldKey}
                level={field}
                courseIndex={courseIndex}
                levelIndex={index}
                contracts={contracts}
                teachers={teachers}
                subjects={subjects}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
