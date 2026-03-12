import { useEffect, useMemo, useState } from 'react'
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
import { PedagogicalContextStep } from '~/containers/pedagogico/pedagogical-context-step'

const schema = z.object({
  name: z.string().min(1, 'Qual o nome da atividade?'),
  dueDate: z.date({ message: 'Quando é a data de entrega?' }),
  noGrade: z.boolean().optional(),
  grade: z
    .preprocess(
      (value) => (typeof value === 'number' && Number.isNaN(value) ? undefined : value),
      z.number().min(0).optional()
    )
    .optional(),
  subjectId: z.string().optional(),
  description: z.string().optional(),
})

interface NewAssignmentModalProps {
  classId: string
  academicPeriodId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDto | null
  defaultDate?: Date
  mode?: 'create' | 'edit'
  assignmentId?: string
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
  mode = 'create',
  assignmentId,
}: NewAssignmentModalProps) {
  const isEditMode = mode === 'edit'
  const requiresContextStep = !classId && !isEditMode
  const [wizardStep, setWizardStep] = useState<'context' | 'form'>(
    requiresContextStep ? 'context' : 'form'
  )
  const [contextValue, setContextValue] = useState({
    academicPeriodId: '',
    levelId: '',
    classId: '',
    subjectId: '',
  })
  const [resolvedContext, setResolvedContext] = useState<{
    classId: string
    subjectId: string
    teacherId: string
    academicPeriodId: string
  } | null>(null)

  const form = useForm({
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
  const { data: assignmentDataRaw } = useQuery({
    ...api.api.v1.assignments.show.queryOptions({ params: { id: assignmentId ?? '' } }),
    enabled: open && isEditMode && !!assignmentId,
  })

  const assignmentData = assignmentDataRaw as any

  const effectiveClassId =
    classId ||
    resolvedContext?.classId ||
    assignmentData?.class?.id ||
    assignmentData?.teacherHasClass?.class?.id ||
    ''

  const { data: classData, isLoading: isLoadingSubjects } = useQuery({
    ...api.api.v1.classes.show.queryOptions({ params: { id: effectiveClassId } }),
    enabled: open && !!effectiveClassId && !requiresContextStep,
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
      if (requiresContextStep) {
        setWizardStep('context')
        setResolvedContext(null)
        setContextValue({ academicPeriodId: '', levelId: '', classId: '', subjectId: '' })
      } else {
        setWizardStep('form')
      }

      form.reset({
        name: assignmentData?.name ?? '',
        dueDate: assignmentData?.dueDate
          ? new Date(assignmentData.dueDate)
          : (defaultDate ?? new Date()),
        noGrade: false,
        grade: assignmentData?.grade ?? undefined,
        subjectId:
          assignmentData?.subject?.id ?? assignmentData?.teacherHasClass?.subject?.id ?? '',
        description: assignmentData?.description ?? '',
      })
    }
  }, [open, form, defaultDate, requiresContextStep, assignmentData])

  const createMutation = useMutation(api.api.v1.assignments.store.mutationOptions())
  const updateMutation = useMutation(api.api.v1.assignments.update.mutationOptions())

  const onSubmit = form.handleSubmit(async (data) => {
    const selectedSubject = requiresContextStep
      ? null
      : subjects?.find((s) => s.id === data.subjectId)

    if (requiresContextStep && !resolvedContext) {
      toast.error('Selecione o contexto da atividade')
      return
    }

    if (!isEditMode && !requiresContextStep && !selectedSubject) {
      toast.error('Selecione uma materia')
      return
    }

    try {
      if (isEditMode) {
        if (!assignmentId) {
          toast.error('Atividade inválida para edição')
          return
        }

        await updateMutation.mutateAsync({
          params: { id: assignmentId },
          body: {
            title: data.name,
            description: data.description,
            maxScore: data.noGrade ? null : (data.grade ?? null),
            dueDate: data.dueDate.toISOString(),
          },
        })
      } else {
        await createMutation.mutateAsync({
          body: {
            title: data.name,
            description: data.description,
            maxScore: data.noGrade ? null : (data.grade ?? null),
            dueDate: data.dueDate.toISOString(),
            classId: requiresContextStep ? (resolvedContext?.classId ?? '') : classId,
            subjectId: requiresContextStep
              ? (resolvedContext?.subjectId ?? '')
              : (data.subjectId ?? ''),
            teacherId: requiresContextStep
              ? (resolvedContext?.teacherId ?? '')
              : (selectedSubject?.teacherId ?? ''),
            academicPeriodId: requiresContextStep
              ? (resolvedContext?.academicPeriodId ?? undefined)
              : undefined,
          },
        })
      }
      queryClient.invalidateQueries({ queryKey: api.api.v1.assignments.index.pathKey() })
      queryClient.invalidateQueries({ queryKey: api.api.v1.pedagogicalCalendar.index.pathKey() })
      toast.success(
        isEditMode ? 'Atividade atualizada com sucesso!' : 'Atividade criada com sucesso!'
      )
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast.error(
        error?.message || (isEditMode ? 'Erro ao atualizar atividade' : 'Erro ao criar atividade')
      )
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar atividade' : 'Criar nova atividade'}</DialogTitle>
          </DialogHeader>

          {wizardStep === 'context' ? (
            <div className="py-4">
              <PedagogicalContextStep
                value={contextValue}
                onChange={setContextValue}
                onResolved={setResolvedContext}
              />
            </div>
          ) : null}

          {wizardStep === 'form' ? (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da atividade *</Label>
                <Input id="name" {...form.register('name')} placeholder="Ex: Trabalho sobre..." />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              {!requiresContextStep && !isEditMode ? (
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
              ) : null}

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
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dueDate.message}
                  </p>
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
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {wizardStep === 'context' ? (
              <Button
                type="button"
                disabled={!resolvedContext}
                onClick={() => setWizardStep('form')}
              >
                Proximo
              </Button>
            ) : null}
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? 'Salvando...' : 'Criando...'}
                </>
              ) : isEditMode ? (
                'Salvar alterações'
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
