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
import { GripVertical, Layers, Plus, MoreVertical, ChevronDown, Check } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import type {
  EditAcademicPeriodFormValues,
  LevelFormValues,
  ClassFormValues,
} from '../schemas/edit_academic_period.schema'
import { EditClassModal } from './edit-class-modal'

interface CourseLevelsProps {
  courseIndex: number
}

interface Contract {
  id: string
  name: string
}

interface Teacher {
  id: string
  user: { name: string }
}

interface Subject {
  id: string
  name: string
}

async function fetchContracts(): Promise<{ data: Contract[] }> {
  const response = await fetch('/api/v1/contracts?limit=100')
  if (!response.ok) throw new Error('Failed to fetch contracts')
  return response.json()
}

async function fetchTeachers(): Promise<{ data: Teacher[] }> {
  const response = await fetch('/api/v1/teachers?limit=100')
  if (!response.ok) throw new Error('Failed to fetch teachers')
  return response.json()
}

async function fetchSubjects(): Promise<{ data: Subject[] }> {
  const response = await fetch('/api/v1/subjects?limit=100')
  if (!response.ok) throw new Error('Failed to fetch subjects')
  return response.json()
}

interface SortableLevelItemProps {
  level: LevelFormValues
  courseIndex: number
  levelIndex: number
  contracts: Contract[]
  teachers: Teacher[]
  subjects: Subject[]
}

function SortableLevelItem({
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: level.levelId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isActive = form.watch(`courses.${courseIndex}.levels.${levelIndex}.isActive`)
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
      form.setValue(`courses.${courseIndex}.levels.${levelIndex}.classes.${editingClassIndex}`, data)
      setEditingClassIndex(null)
    } else {
      appendClass(data)
      setShowNewClassModal(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center justify-between rounded-lg border bg-background p-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {level.order + 1}
            </Badge>
            <span className="font-medium">{level.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
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
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>

          <div className="flex items-center gap-2">
            <Label
              htmlFor={`level-active-${level.levelId}`}
              className="text-sm text-muted-foreground"
            >
              Ativo
            </Label>
            <Switch
              id={`level-active-${level.levelId}`}
              checked={isActive}
              onCheckedChange={(checked) => {
                form.setValue(`courses.${courseIndex}.levels.${levelIndex}.isActive`, checked)
              }}
            />
          </div>
        </div>
      </div>

      {classes.length > 0 && (
        <div className="ml-12 mt-2 space-y-2">
          {classes.map((classItem: ClassFormValues, classIndex: number) => (
            <div
              key={`class-${classIndex}`}
              className="flex items-center gap-2 rounded border bg-muted/30 p-3"
            >
              <div className="flex-1">
                <p className="font-medium">{classItem.name}</p>
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
              >
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon">
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
  const { fields, move } = useFieldArray({
    control: form.control,
    name: `courses.${courseIndex}.levels`,
  })

  const { data: contractsData } = useQuery({
    queryKey: ['contracts'],
    queryFn: fetchContracts,
  })

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects,
  })

  const contracts = contractsData?.data || []
  const teachers = teachersData?.data || []
  const subjects = subjectsData?.data || []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.levelId === active.id)
      const newIndex = fields.findIndex((field) => field.levelId === over.id)

      move(oldIndex, newIndex)

      // Update order values
      const newFields = arrayMove(fields, oldIndex, newIndex)
      newFields.forEach((_, index) => {
        form.setValue(`courses.${courseIndex}.levels.${index}.order`, index)
      })
    }
  }

  if (fields.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Layers className="h-4 w-4" />
        <span>Nenhum nível configurado</span>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.levelId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {fields.map((field, index) => (
            <SortableLevelItem
              key={field.levelId}
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
  )
}
