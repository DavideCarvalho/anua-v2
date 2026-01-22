import { useFormContext, useFieldArray } from 'react-hook-form'
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
import { GripVertical, Layers } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import type { EditAcademicPeriodFormValues, LevelFormValues } from '../schemas/edit-academic-period.schema'

interface CourseLevelsProps {
  courseIndex: number
}

interface SortableLevelItemProps {
  level: LevelFormValues
  courseIndex: number
  levelIndex: number
}

function SortableLevelItem({ level, courseIndex, levelIndex }: SortableLevelItemProps) {
  const form = useFormContext<EditAcademicPeriodFormValues>()
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-lg border bg-background p-3"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
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
      <div className="flex items-center gap-2">
        <Label htmlFor={`level-active-${level.levelId}`} className="text-sm text-muted-foreground">
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
  )
}

export function CourseLevels({ courseIndex }: CourseLevelsProps) {
  const form = useFormContext<EditAcademicPeriodFormValues>()
  const { fields, move } = useFieldArray({
    control: form.control,
    name: `courses.${courseIndex}.levels`,
  })

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
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
