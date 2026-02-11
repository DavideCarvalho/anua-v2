'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { GripVertical, Plus, Check, MoreVertical, ChevronDown, Trash2 } from 'lucide-react'

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
import { FormControl, FormField, FormItem } from '~/components/ui/form'
import { useTeachersQueryOptions } from '~/hooks/queries/use_teachers'
import { useSubjectsQueryOptions } from '~/hooks/queries/use_subjects'

import type { AcademicPeriodFormValues } from '../new-academic-period-form'
import { NewClassModal } from './new-class-modal'

interface SortableLevelProps {
  id: string
  index: number
  courseIndex: number
  contracts: Array<{ id: string; name: string }>
  onCreateContract: () => void
  onDeleteLevel: () => void
}

export function SortableLevel({
  id,
  index,
  courseIndex,
  contracts,
  onCreateContract,
  onDeleteLevel,
}: SortableLevelProps) {
  const { setValue, watch, control } = useFormContext<AcademicPeriodFormValues>()
  const contractId = watch(`courses.${courseIndex}.levels.${index}.contractId`)
  const selectedContract = contracts.find((c) => c.id === contractId)
  const classes = watch(`courses.${courseIndex}.levels.${index}.classes`) || []

  const [showNewClassModal, setShowNewClassModal] = useState(false)
  const [editingClassIndex, setEditingClassIndex] = useState<number | null>(null)

  const { data: teachersData } = useQuery(useTeachersQueryOptions({ limit: 100 }))
  const { data: subjectsData } = useQuery(useSubjectsQueryOptions({ limit: 100 }))

  const teachers = teachersData?.data ?? []
  const subjects = subjectsData?.data ?? []

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const { append: appendClass, remove: removeClass } = useFieldArray({
    control,
    name: `courses.${courseIndex}.levels.${index}.classes`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSaveClass = (data: {
    name: string
    teachers: Array<{ teacherId: string; subjectId: string; subjectQuantity: number }>
  }) => {
    if (editingClassIndex !== null) {
      setValue(`courses.${courseIndex}.levels.${index}.classes.${editingClassIndex}`, data)
      setEditingClassIndex(null)
    } else {
      appendClass(data)
      setShowNewClassModal(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
        <button type="button" className="cursor-grab touch-none" {...listeners}>
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex flex-1 items-center gap-4">
          <FormField
            control={control}
            name={`courses.${courseIndex}.levels.${index}.name`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Nome do nível/série" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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
                    setValue(`courses.${courseIndex}.levels.${index}.contractId`, contract.id)
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{contract.name}</span>
                    {contractId === contract.id && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={onCreateContract}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contrato
              </DropdownMenuItem>
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
                  Essa ação vai remover o nível e as turmas vinculadas deste formulário.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onDeleteLevel}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {classes.length > 0 && (
        <div className="ml-12 mt-2 space-y-2">
          {classes.map((classItem: any, classIndex: number) => (
            <div
              key={`class-${classIndex}`}
              className="flex items-center gap-2 rounded border bg-muted/30 p-3"
            >
              <div className="flex-1">
                <p className="font-medium">{classItem.name}</p>
                {classItem.teachers?.length > 0 && (
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
                  <Button variant="ghost" size="icon">
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

      <NewClassModal
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
