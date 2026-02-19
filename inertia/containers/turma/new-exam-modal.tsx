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
import { useClassQueryOptions } from '~/hooks/queries/use_class'
import { useCreateExam } from '~/hooks/mutations/use_create_exam'

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
  subjectId: z.string().min(1, 'Qual materia?'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface NewExamModalProps {
  classId: string
  academicPeriodId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDto | null
}

interface Subject {
  id: string
  name: string
  teacherId: string
}

interface TeacherClass {
  teacherId: string
  subject: { id: string; name: string } | null
  teacher: { user: { id: string } } | null
}

const DIRECTOR_ROLES = ['SCHOOL_DIRECTOR', 'SCHOOL_COORDINATOR', 'ADMIN', 'SUPER_ADMIN']

export function NewExamModal({
  classId,
  academicPeriodId,
  open,
  onOpenChange,
  user,
}: NewExamModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      scheduledDate: new Date(),
      maxScore: 10,
      type: 'WRITTEN',
      description: '',
      subjectId: '',
    },
  })

  const { data: classData, isLoading: isLoadingSubjects } = useQuery({
    ...useClassQueryOptions(classId),
    enabled: open && !!classId,
  })

  const subjects = useMemo(() => {
    if (!classData) return []
    const isDirectorOrAdmin = user?.role?.name && DIRECTOR_ROLES.includes(user.role.name)
    const result: Subject[] = []
    const seen = new Set<string>()
    for (const tc of ((classData as any).teacherClasses || []) as TeacherClass[]) {
      if (!tc.subject || seen.has(tc.subject.id)) continue
      const canSeeSubject = isDirectorOrAdmin || tc.teacher?.user?.id === user?.id
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
        title: '',
        scheduledDate: new Date(),
        maxScore: 10,
        type: 'WRITTEN',
        description: '',
        subjectId: subjects?.length === 1 ? subjects[0]?.id : '',
      })
    }
  }, [open, form, subjects])

  const createMutation = useCreateExam()

  const onSubmit = form.handleSubmit(async (data) => {
    const selectedSubject = subjects?.find((s) => s.id === data.subjectId)
    if (!selectedSubject) {
      toast.error('Selecione uma materia')
      return
    }

    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description,
        maxScore: data.maxScore,
        type: data.type,
        scheduledDate: data.scheduledDate.toISOString(),
        classId,
        subjectId: data.subjectId,
        teacherId: selectedSubject.teacherId,
      })
      toast.success('Prova criada com sucesso!')
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar prova')
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Criar nova prova</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nome da prova *</Label>
              <Input id="title" {...form.register('title')} placeholder="Ex: Prova de Matematica" />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pra qual materia? *</Label>
              {isLoadingSubjects ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando materias...
                </div>
              ) : (
                <Select
                  value={form.watch('subjectId')}
                  onValueChange={(value) => form.setValue('subjectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a materia" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de prova *</Label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(value) => form.setValue('type', value as FormValues['type'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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
