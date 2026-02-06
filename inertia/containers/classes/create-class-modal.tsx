import { useEffect, useMemo } from 'react'
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usePage } from '@inertiajs/react'
import { Plus, Minus, Loader2, AlertCircle } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { SharedProps } from '~/lib/types'
import { useTeacherSubjectsQueryOptions } from '~/hooks/queries/use_teacher_subjects'
import { useTeachersQueryOptions } from '~/hooks/queries/use_teachers'
import { useCreateClassWithTeachers } from '~/hooks/mutations/use_class_mutations'

const createClassSchema = z.object({
  name: z.string().min(1, 'Qual o nome da turma?'),
  subjectsWithTeachers: z.array(
    z.object({
      teacherId: z.string().min(1, 'Selecione um professor'),
      subjectId: z.string().min(1, 'Selecione uma matéria'),
      quantity: z.number().min(1),
    })
  ),
})

type CreateClassFormValues = z.infer<typeof createClassSchema>

interface Teacher {
  id: string
  user?: { name: string }
}

interface CreateClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (classId: string) => void
}

function SubjectTeacherRow({
  index,
  form,
  remove,
  teachers,
  canRemove,
}: {
  index: number
  form: UseFormReturn<CreateClassFormValues>
  remove: (index: number) => void
  teachers: Teacher[]
  canRemove: boolean
}) {
  const selectedTeacherId = form.watch(`subjectsWithTeachers.${index}.teacherId`)
  const selectedSubjectId = form.watch(`subjectsWithTeachers.${index}.subjectId`)

  // Get subjects for selected teacher
  const { data: teacherSubjectsData, isLoading: isLoadingSubjects } = useQuery({
    ...useTeacherSubjectsQueryOptions(selectedTeacherId || ''),
    enabled: !!selectedTeacherId,
  })

  const teacherSubjects = useMemo(() => {
    const rawData = teacherSubjectsData ?? []
    // API returns TeacherHasSubject with nested subject, extract the subject info
    return rawData.map((item: { subject?: { id: string; name: string }; id: string; name?: string }) => {
      if (item.subject) {
        return { id: item.subject.id, name: item.subject.name }
      }
      return { id: item.id, name: item.name || '' }
    })
  }, [teacherSubjectsData])

  const hasNoSubjects = selectedTeacherId && !isLoadingSubjects && teacherSubjects.length === 0

  // Clear subject when teacher changes
  useEffect(() => {
    if (selectedTeacherId && selectedSubjectId) {
      const subjectExists = teacherSubjects.some(
        (s: { id: string }) => s.id === selectedSubjectId
      )
      if (!subjectExists && teacherSubjects.length > 0) {
        form.setValue(`subjectsWithTeachers.${index}.subjectId`, '')
      }
    }
  }, [selectedTeacherId, teacherSubjects]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">Professor</Label>
        <Select
          value={selectedTeacherId || ''}
          onValueChange={(value) => {
            form.setValue(`subjectsWithTeachers.${index}.teacherId`, value)
            form.setValue(`subjectsWithTeachers.${index}.subjectId`, '')
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.user?.name || 'Professor'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">Matéria</Label>
        <Select
          value={selectedSubjectId || ''}
          onValueChange={(value) => {
            form.setValue(`subjectsWithTeachers.${index}.subjectId`, value)
          }}
          disabled={!selectedTeacherId || !!hasNoSubjects}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={hasNoSubjects ? 'Sem disciplinas' : ''} />
          </SelectTrigger>
          <SelectContent>
            {teacherSubjects.map((subject: { id: string; name: string }) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasNoSubjects && (
          <div className="flex items-center gap-1 text-amber-600 text-xs mt-1">
            <AlertCircle className="h-3 w-3" />
            <span>Professor sem disciplinas</span>
          </div>
        )}
      </div>

      <div className="w-16">
        <Input
          type="number"
          min={1}
          {...form.register(`subjectsWithTeachers.${index}.quantity`, {
            valueAsNumber: true,
          })}
          className="text-center"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove(index)}
        disabled={!canRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function CreateClassModal({ open, onOpenChange, onCreated }: CreateClassModalProps) {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema) as any,
    defaultValues: {
      name: '',
      subjectsWithTeachers: [{ teacherId: '', subjectId: '', quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjectsWithTeachers',
  })

  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    ...useTeachersQueryOptions({ limit: 100 }),
    enabled: open,
  })

  const teachers = useMemo(() => {
    return (teachersData?.data ?? []) as Teacher[]
  }, [teachersData])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        subjectsWithTeachers: [{ teacherId: '', subjectId: '', quantity: 1 }],
      })
    }
  }, [open, form])

  const createMutation = useCreateClassWithTeachers()

  const onSubmit = form.handleSubmit((data) => {
    if (!schoolId) {
      toast.error('Escola não encontrada')
      return
    }
    createMutation.mutate(
      {
        name: data.name,
        schoolId: schoolId || '',
        subjectsWithTeachers: data.subjectsWithTeachers,
      } as any,
      {
        onSuccess: (result: any) => {
          toast.success('Turma criada com sucesso')
          onOpenChange(false)
          if (onCreated && result.id) {
            onCreated(result.id)
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Erro ao criar turma')
        },
      }
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova turma</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da turma *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Digite o nome da turma"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {isLoadingTeachers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SubjectTeacherRow
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                  teachers={teachers}
                  canRemove={fields.length > 1}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ teacherId: '', subjectId: '', quantity: 1 })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar matéria
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
