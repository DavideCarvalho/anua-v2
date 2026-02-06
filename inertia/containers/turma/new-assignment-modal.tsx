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
import { useCreateAssignment } from '~/hooks/mutations/use_create_assignment'

const schema = z.object({
  name: z.string().min(1, 'Qual o nome da atividade?'),
  dueDate: z.date({ message: 'Quando é a data de entrega?' }),
  grade: z.number({ message: 'Qual a nota?' }).min(0),
  subjectId: z.string().min(1, 'Qual matéria?'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface NewAssignmentModalProps {
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

export function NewAssignmentModal({
  classId,
  academicPeriodId,
  open,
  onOpenChange,
  user,
}: NewAssignmentModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      dueDate: new Date(),
      grade: 10,
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
        name: '',
        dueDate: new Date(),
        grade: 10,
        description: '',
        subjectId: subjects?.length === 1 ? subjects[0]?.id : '',
      })
    }
  }, [open, form, subjects])

  const createMutation = useCreateAssignment()

  const onSubmit = form.handleSubmit(async (data) => {
    const selectedSubject = subjects?.find((s) => s.id === data.subjectId)
    if (!selectedSubject) {
      toast.error('Selecione uma materia')
      return
    }

    try {
      await createMutation.mutateAsync({
        title: data.name,
        description: data.description,
        maxScore: data.grade,
        dueDate: data.dueDate.toISOString(),
        classId,
        subjectId: data.subjectId,
        teacherId: selectedSubject.teacherId,
      })
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
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Ex: Trabalho sobre..."
              />
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
                  onValueChange={(value) => form.setValue('subjectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a matéria" />
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
              <Label htmlFor="grade">Quanto vale? *</Label>
              <Input
                id="grade"
                type="number"
                min={0}
                step={0.1}
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
