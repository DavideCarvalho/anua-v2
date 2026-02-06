import { useEffect, useMemo } from 'react'
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'

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
import { tuyau } from '~/lib/api'
import { useTeachersQueryOptions } from '~/hooks/queries/use_teachers'
import { useTeacherSubjectsQueryOptions } from '~/hooks/queries/use_teacher_subjects'

const editClassSchema = z.object({
  name: z.string().min(1, 'Nome da turma é obrigatório'),
  subjectsWithTeachers: z.array(
    z.object({
      teacherId: z.string().min(1, 'Selecione um professor'),
      subjectId: z.string().min(1, 'Selecione uma matéria'),
      quantity: z.number().min(1, 'Mínimo 1 aula').max(20, 'Máximo 20 aulas'),
    })
  ),
})

type EditClassFormValues = z.infer<typeof editClassSchema>

interface TeacherClassData {
  id: string
  teacherId: string
  subjectId: string
  subjectQuantity: number
  teacher?: { id: string; user?: { name: string } }
  subject?: { id: string; name: string }
}

interface ClassData {
  id: string
  name: string
  teacherClasses?: TeacherClassData[]
}

interface EditClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classData: ClassData | null
}

function SubjectTeacherRow({
  index,
  form,
  remove,
  teachers,
  initialSubject,
}: {
  index: number
  form: UseFormReturn<EditClassFormValues>
  remove: (index: number) => void
  teachers: Array<{ id: string; user?: { name: string } }>
  initialSubject?: { id: string; name: string }
}) {
  const selectedTeacherId = form.watch(`subjectsWithTeachers.${index}.teacherId`)
  const selectedSubjectId = form.watch(`subjectsWithTeachers.${index}.subjectId`)

  // Get subjects for selected teacher
  const { data: teacherSubjectsData, isLoading: isLoadingSubjects } = useQuery({
    ...useTeacherSubjectsQueryOptions(selectedTeacherId || ''),
    enabled: !!selectedTeacherId,
  })

  const teacherSubjects = useMemo(() => {
    if (!teacherSubjectsData) return []

    // Extract subjects from the TeacherHasSubject array
    const subjects = teacherSubjectsData
      .filter((item) => item.subject)
      .map((item) => ({
        id: item.subject!.id,
        name: item.subject!.name,
      }))

    // If we have an initial subject that's not in the list, add it
    if (initialSubject && selectedSubjectId === initialSubject.id) {
      const hasInitialSubject = subjects.some((s) => s.id === initialSubject.id)
      if (!hasInitialSubject) {
        return [...subjects, initialSubject]
      }
    }

    return subjects
  }, [teacherSubjectsData, initialSubject, selectedSubjectId])

  const hasNoSubjects = selectedTeacherId && !isLoadingSubjects && teacherSubjects.length === 0

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Professor</Label>
            <Select
              value={selectedTeacherId || ''}
              onValueChange={(value) => {
                form.setValue(`subjectsWithTeachers.${index}.teacherId`, value)
                form.setValue(`subjectsWithTeachers.${index}.subjectId`, '')
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione..." />
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

          <div>
            <Label className="text-xs text-muted-foreground">Matéria</Label>
            <Select
              value={selectedSubjectId || ''}
              onValueChange={(value) => {
                form.setValue(`subjectsWithTeachers.${index}.subjectId`, value)
              }}
              disabled={!selectedTeacherId || !!hasNoSubjects}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={hasNoSubjects ? 'Sem disciplinas' : 'Selecione...'} />
              </SelectTrigger>
              <SelectContent>
                {teacherSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Aulas/semana</Label>
            <Input
              type="number"
              min={1}
              max={20}
              className="mt-1"
              {...form.register(`subjectsWithTeachers.${index}.quantity`, {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>

        {hasNoSubjects && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Professor sem disciplinas cadastradas</span>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive self-start mt-6"
        onClick={() => remove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function EditClassModal({ open, onOpenChange, classData }: EditClassModalProps) {
  const queryClient = useQueryClient()

  // Memoize initial values to prevent unnecessary resets
  const initialValues = useMemo(() => {
    if (!classData) {
      return { name: '', subjectsWithTeachers: [] }
    }
    return {
      name: classData.name,
      subjectsWithTeachers:
        classData.teacherClasses?.map((tc) => ({
          teacherId: tc.teacherId,
          subjectId: tc.subjectId,
          quantity: tc.subjectQuantity,
        })) || [],
    }
  }, [classData])

  const form = useForm<EditClassFormValues>({
    resolver: zodResolver(editClassSchema) as any,
    defaultValues: initialValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjectsWithTeachers',
  })

  // Fetch teachers
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery(
    useTeachersQueryOptions({ limit: 100 })
  )

  // Combine API teachers with teachers from classData to ensure they appear in the list
  const teachers = useMemo(() => {
    const apiTeachers = teachersData?.data ?? []

    if (!classData?.teacherClasses) return apiTeachers

    // Create a map of existing teachers
    const teacherMap = new Map(apiTeachers.map((t) => [t.id, t]))

    // Add teachers from classData that might not be in the API response
    classData.teacherClasses.forEach((tc) => {
      if (tc.teacher && !teacherMap.has(tc.teacher.id)) {
        teacherMap.set(tc.teacher.id, {
          id: tc.teacher.id,
          user: tc.teacher.user,
        })
      }
    })

    return Array.from(teacherMap.values())
  }, [teachersData, classData])

  // Create a map of initial subjects for each row
  const initialSubjectsMap = useMemo(() => {
    if (!classData?.teacherClasses) return new Map()
    const map = new Map<number, { id: string; name: string }>()
    classData.teacherClasses.forEach((tc, index) => {
      if (tc.subject) {
        map.set(index, { id: tc.subject.id, name: tc.subject.name })
      }
    })
    return map
  }, [classData])

  // Reset form when classData changes
  useEffect(() => {
    if (classData && open) {
      form.reset({
        name: classData.name,
        subjectsWithTeachers:
          classData.teacherClasses?.map((tc) => ({
            teacherId: tc.teacherId,
            subjectId: tc.subjectId,
            quantity: tc.subjectQuantity,
          })) || [],
      })
    }
  }, [classData, open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mutation to update class
  const updateMutation = useMutation({
    mutationFn: (data: EditClassFormValues) => {
      if (!classData) throw new Error('Turma não encontrada')

      return tuyau.$route('api.v1.classes.update', { id: classData.id } as any)
        .$put({
          name: data.name,
          subjectsWithTeachers: data.subjectsWithTeachers,
        } as any)
        .unwrap()
    },
    onSuccess: () => {
      toast.success('Turma atualizada com sucesso')
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    updateMutation.mutate(data)
  })

  const addSubject = () => {
    append({ teacherId: '', subjectId: '', quantity: 1 })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Turma</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nome da turma *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Ex: 6° Ano A"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Professores e Matérias</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar matéria
              </Button>
            </div>

            {isLoadingTeachers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : fields.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma matéria adicionada. Clique em "Adicionar matéria" para vincular professores.
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <SubjectTeacherRow
                    key={field.id}
                    index={index}
                    form={form}
                    remove={remove}
                    teachers={teachers}
                    initialSubject={initialSubjectsMap.get(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
