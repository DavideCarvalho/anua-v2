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

const examTypes = [
  { value: 'WRITTEN', label: 'Escrita' },
  { value: 'ORAL', label: 'Oral' },
  { value: 'PRACTICAL', label: 'Pratica' },
  { value: 'PROJECT', label: 'Projeto' },
  { value: 'QUIZ', label: 'Quiz' },
] as const

const schema = z.object({
  title: z.string().min(1, 'Qual o nome da prova?'),
  scheduledDate: z.date({ message: 'Quando e a data da prova?' }),
  maxScore: z.number({ message: 'Qual a pontuação máxima?' }).min(0),
  type: z.enum(['WRITTEN', 'ORAL', 'PRACTICAL', 'PROJECT', 'QUIZ'], {
    message: 'Qual o tipo da prova?',
  }),
  subjectId: z.string().min(1, 'Qual matéria?'),
  description: z.string().optional(),
  subPeriodId: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface NewExamModalProps {
  classId: string
  academicPeriodId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDto | null
  defaultDate?: Date
  mode?: 'create' | 'edit'
  examId?: string
}

interface Subject {
  id: string
  name: string
  teacherId: string
}

const DIRECTOR_ROLES = ['SCHOOL_DIRECTOR', 'SCHOOL_COORDINATOR', 'ADMIN', 'SUPER_ADMIN']

export function NewExamModal({
  classId,
  academicPeriodId,
  open,
  onOpenChange,
  user,
  defaultDate,
  mode = 'create',
  examId,
}: NewExamModalProps) {
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      scheduledDate: defaultDate ?? new Date(),
      maxScore: 10,
      type: 'WRITTEN',
      description: '',
      subjectId: '',
    },
  })

  const queryClient = useQueryClient()
  const { data: examDataRaw } = useQuery({
    ...api.api.v1.exams.show.queryOptions({ params: { id: examId ?? '' } }),
    enabled: open && isEditMode && !!examId,
  })

  const examData = examDataRaw as any

  const effectiveClassId = classId || resolvedContext?.classId || examData?.class?.id || ''

  const { data: classData, isLoading: isLoadingSubjects } = useQuery({
    ...api.api.v1.classes.show.queryOptions({ params: { id: effectiveClassId } }),
    enabled: open && !!effectiveClassId && !requiresContextStep,
  })

  const effectiveAcademicPeriodId =
    academicPeriodId || resolvedContext?.academicPeriodId || examData?.academicPeriodId || ''

  const { data: schoolData } = useQuery({
    ...api.api.v1.schools.show.queryOptions({
      params: { id: user?.schoolId ?? '' },
    }),
    enabled: open && !!user?.schoolId,
  })

  const usesSubPeriods =
    schoolData && (schoolData as any).periodStructure && (schoolData as any).periodStructure !== ''

  const { data: subPeriodsData } = useQuery({
    ...api.api.v1.academicSubPeriods.index.queryOptions({
      query: { academicPeriodId: effectiveAcademicPeriodId },
    }),
    enabled: open && !!effectiveAcademicPeriodId && !!usesSubPeriods,
  })

  const subPeriods = (subPeriodsData?.data ?? []) as Array<{
    id: string
    name: string
    order: number
    startDate: string
    endDate: string
  }>

  const getCurrentSubPeriodId = (): string | null => {
    if (!usesSubPeriods || subPeriods.length === 0) return null
    const today = new Date()
    for (const sp of subPeriods) {
      const start = new Date(sp.startDate)
      const end = new Date(sp.endDate)
      if (today >= start && today <= end) {
        return sp.id
      }
    }
    return null
  }

  const subjects = useMemo(() => {
    if (!classData) return []
    const canSeeAllSubjects = !user || (user.role?.name && DIRECTOR_ROLES.includes(user.role.name))
    const result: Subject[] = []
    const seen = new Set<string>()
    const teacherClasses = classData.teacherClasses || []

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

  const currentExamType = form.watch('type')
  const selectedExamTypeLabel =
    examTypes.find((type) => type.value === currentExamType)?.label ?? 'Selecione o tipo'

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
        title: examData?.title ?? '',
        scheduledDate:
          examData?.scheduledDate || examData?.examDate
            ? new Date(examData?.scheduledDate ?? examData?.examDate)
            : (defaultDate ?? new Date()),
        maxScore: examData?.maxScore ?? 10,
        type: examData?.type ?? 'WRITTEN',
        description: examData?.description ?? '',
        subjectId: examData?.subject?.id ?? '',
        subPeriodId: examData?.subPeriod?.id ?? getCurrentSubPeriodId(),
      })
    }
  }, [open, form, defaultDate, requiresContextStep, examData])

  const createMutation = useMutation(api.api.v1.exams.store.mutationOptions())
  const updateMutation = useMutation(api.api.v1.exams.update.mutationOptions())

  const onSubmit = form.handleSubmit(async (data) => {
    const selectedSubject = requiresContextStep
      ? null
      : subjects?.find((s) => s.id === data.subjectId)

    if (requiresContextStep && !resolvedContext) {
      toast.error('Selecione o contexto da prova')
      return
    }

    if (!isEditMode && !requiresContextStep && !selectedSubject) {
      toast.error('Selecione uma matéria')
      return
    }

    try {
      if (isEditMode) {
        if (!examId) {
          toast.error('Prova inválida para edição')
          return
        }

        await updateMutation.mutateAsync({
          params: { id: examId },
          body: {
            title: data.title,
            description: data.description,
            maxScore: data.maxScore,
            type: data.type,
            scheduledDate: data.scheduledDate.toISOString(),
            subPeriodId: data.subPeriodId || null,
          },
        })
      } else {
        await createMutation.mutateAsync({
          body: {
            title: data.title,
            description: data.description,
            maxScore: data.maxScore,
            type: data.type,
            scheduledDate: data.scheduledDate.toISOString(),
            classId: requiresContextStep ? (resolvedContext?.classId ?? '') : classId,
            subjectId: requiresContextStep ? (resolvedContext?.subjectId ?? '') : data.subjectId,
            teacherId: requiresContextStep
              ? (resolvedContext?.teacherId ?? '')
              : (selectedSubject?.teacherId ?? ''),
            academicPeriodId: requiresContextStep
              ? (resolvedContext?.academicPeriodId ?? undefined)
              : academicPeriodId,
            subPeriodId: data.subPeriodId || undefined,
          },
        })
      }
      queryClient.invalidateQueries({ queryKey: api.api.v1.exams.index.pathKey() })
      queryClient.invalidateQueries({ queryKey: api.api.v1.pedagogicalCalendar.index.pathKey() })
      toast.success(isEditMode ? 'Prova atualizada com sucesso!' : 'Prova criada com sucesso!')
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast.error(
        error?.message || (isEditMode ? 'Erro ao atualizar prova' : 'Erro ao criar prova')
      )
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar prova' : 'Criar nova prova'}</DialogTitle>
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
                <Label htmlFor="title">Nome da prova *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Ex: Prova de Matematica"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
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

              {usesSubPeriods && subPeriods.length > 0 ? (
                <div className="space-y-2">
                  <Label>Sub-Periodo (opcional)</Label>
                  <Select
                    value={form.watch('subPeriodId') ?? ''}
                    onValueChange={(value, _event) => form.setValue('subPeriodId', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sub-periodo">
                        {subPeriods?.find((sp) => sp.id === form.watch('subPeriodId'))?.name ??
                          (form.watch('subPeriodId') ? 'Carregando...' : 'Selecione o sub-periodo')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {subPeriods
                        .sort((a, b) => a.order - b.order)
                        .map((sp) => (
                          <SelectItem key={sp.id} value={sp.id}>
                            {sp.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de prova *</Label>
                  <Select
                    value={form.watch('type')}
                    onValueChange={(value, _event) =>
                      value !== null && form.setValue('type', value as FormValues['type'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo">
                        {selectedExamTypeLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxScore">Pontuacao maxima *</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min={0}
                    step={0.1}
                    {...form.register('maxScore', { valueAsNumber: true })}
                  />
                  {form.formState.errors.maxScore && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.maxScore.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quando e a prova? *</Label>
                <DatePicker
                  date={form.watch('scheduledDate')}
                  onChange={(date) => {
                    if (date) form.setValue('scheduledDate', date)
                  }}
                  fromDate={new Date()}
                />
                {form.formState.errors.scheduledDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.scheduledDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descricao (opcional)</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Conteudo da prova, instrucoes, etc."
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
