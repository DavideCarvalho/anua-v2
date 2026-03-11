import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date-picker'
import type { UserDto } from '~/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

const schema = z.object({
  name: z.string().min(1, 'Qual o nome da atividade?'),
  dueDate: z.date({ message: 'Quando é a data de entrega?' }),
  noGrade: z.boolean().optional(),
  grade: z.number().min(0).optional(),
  subjectId: z.string().min(1, 'Qual matéria?'),
  description: z.string().optional(),
})

type FormValues = {
  name: string
  dueDate: Date
  noGrade?: boolean
  grade?: number
  subjectId: string
  description?: string
}

interface NewAssignmentModalProps {
  classId: string
  academicPeriodId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDto | null
  defaultDate?: Date
}

interface Subject {
  id: string
  name: string
  teacherId: string
}

const DIRECTOR_ROLES = ['SCHOOL_DIRECTOR', 'SCHOOL_COORDINATOR', 'ADMIN', 'SUPER_ADMIN']

export function NewAssignmentModal({
  classId,
  academicPeriodId: _academicPeriodId,
  open,
  onOpenChange,
  user,
  defaultDate,
}: NewAssignmentModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      dueDate: defaultDate ?? new Date(),
      noGrade: false,
      grade: undefined,
      subjectId: '',
      description: '',
    },
  })

  const queryClient = useQueryClient()
  const { data: classData, isLoading: isLoadingSubjects } = useQuery({
    ...api.api.v1.classes.show.queryOptions({ params: { id: classId } }),
    enabled: open && !!classId,
  })

  const subjects = useMemo(() => {
    if (!classData) return []
    const canSeeAllSubjects = !user || (user.role?.name && DIRECTOR_ROLES.includes(user.role.name))
    const result: Subject[] = []
    const seen = new Set<string>()
    const teacherClasses = classData.teacherClasses

    for (const tc of teacherClasses) {
      if (!tc.subject || seen.has(tc.subject.id)) continue
      const canSeeSubject = canSeeAllSubjects || tc.teacher?.user?.id === user?.id
      if (canSeeSubject) {
        seen.add(tc.subject.id)
        result.push({ id: tc.subject.id, name: tc.subject.name, teacherId: tc.teacherId })
      }
    }
    return result
  }, [classData, user])

  // Auto-select first subject if only one
  useEffect(() => {
    if (subjects && subjects.length === 1 && subjects[0]) {
      form.setValue('subjectId', subjects[0].id)
    }
  }, [subjects, form])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        dueDate: defaultDate ?? new Date(),
        noGrade: false,
        grade: undefined,
        subjectId: subjects?.length === 1 ? subjects[0]?.id : '',
        description: '',
      })
    }
  }, [open, form, subjects, defaultDate])

  const createMutation = useMutation(api.api.v1.assignments.store.mutationOptions())

  const onSubmit = form.handleSubmit(async (data) => {
    const selectedSubject = subjects?.find((s) => s.id === data.subjectId)
    if (!selectedSubject) {
      toast.error('Selecione uma materia')
      return
    }

    try {
      await createMutation.mutateAsync({
        body: {
          title: data.name,
          description: data.description,
          maxScore: data.noGrade ? null : (data.grade ?? null),
          dueDate: data.dueDate.toISOString(),
          classId,
          subjectId: data.subjectId,
          teacherId: selectedSubject.teacherId,
        },
      })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      toast.success('Atividade criada com sucesso!')
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar atividade')
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Criar nova atividade</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da atividade *</Label>
              <Input id="name" {...form.register('name')} placeholder="Ex: Trabalho sobre..." />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pra qual matéria? *</Label>
              {isLoadingSubjects ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando matérias...
                </div>
              ) : (
                <Select
                  value={form.watch('subjectId')}
                  onValueChange={(value, _event) =>
                    value !== null && form.setValue('subjectId', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a matéria">
                      {subjects?.find((s) => s.id === form.watch('subjectId'))?.name ??
                        (form.watch('subjectId') ? 'Carregando...' : 'Selecione a matéria')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.subjectId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.subjectId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="grade">Quanto vale?</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noGrade"
                    {...form.register('noGrade')}
                    onChange={(e) => {
                      form.setValue('noGrade', e.target.checked)
                      if (e.target.checked) {
                        form.setValue('grade', undefined)
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="noGrade" className="text-sm font-normal cursor-pointer">
                    Sem nota
                  </Label>
                </div>
              </div>
              <Input
                id="grade"
                type="number"
                min={0}
                step={0.1}
                disabled={form.watch('noGrade')}
                {...form.register('grade', { valueAsNumber: true })}
              />
              {form.formState.errors.grade && (
                <p className="text-sm text-destructive">{form.formState.errors.grade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Quando é a entrega? *</Label>
              <DatePicker
                date={form.watch('dueDate')}
                onChange={(date) => {
                  if (date) form.setValue('dueDate', date)
                }}
                fromDate={new Date()}
              />
              {form.formState.errors.dueDate && (
                <p className="text-sm text-destructive">{form.formState.errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="A atividade é sobre..."
                {...form.register('description')}
              />
            </div>
          </div>

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
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
