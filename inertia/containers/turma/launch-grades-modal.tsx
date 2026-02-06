import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save, Users } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { ScrollArea } from '~/components/ui/scroll-area'
import { ErrorBoundary } from '~/components/error-boundary'
import { useClassStudentsQueryOptions } from '~/hooks/queries/use_class_students'
import { useAssignmentSubmissionsQueryOptions } from '~/hooks/queries/use_assignment_submissions'
import { useBatchSaveGrades } from '~/hooks/mutations/use_batch_save_grades'

interface LaunchGradesModalProps {
  assignmentId: string
  assignmentName: string
  maxGrade: number
  classId: string
  courseId: string
  academicPeriodId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Student {
  id: string
  user?: {
    name: string
  }
}

interface StudentGrade {
  studentId: string
  name: string
  grade: number | null
  submittedAt: string | null
}

const schema = z.object({
  grades: z.array(
    z.object({
      studentId: z.string(),
      name: z.string(),
      grade: z.number().min(0).nullable(),
      submittedAt: z.string().nullable(),
    })
  ),
})

type FormValues = z.infer<typeof schema>


function LaunchGradesModalSkeleton() {
  return (
    <div className="py-12 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Carregando alunos...</p>
    </div>
  )
}

function LaunchGradesModalEmpty() {
  return (
    <div className="py-12 text-center">
      <Users className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Nenhum aluno encontrado</p>
    </div>
  )
}

function LaunchGradesModalContent({
  assignmentId,
  maxGrade,
  classId,
  courseId,
  academicPeriodId,
  onOpenChange,
}: Omit<LaunchGradesModalProps, 'open'>) {
  const today = new Date().toISOString().split('T')[0]

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      grades: [],
    },
  })

  const studentsQueryOptions = useClassStudentsQueryOptions({
    classId,
    courseId,
    academicPeriodId,
    limit: 1000,
  })

  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery(studentsQueryOptions)
  const students = studentsResponse?.data || []

  const { data: submissionsResponse, isLoading: isLoadingGrades } = useQuery(
    useAssignmentSubmissionsQueryOptions({ assignmentId, limit: 1000 })
  )

  const existingGrades = (() => {
    if (!submissionsResponse) return []
    const submissions = submissionsResponse?.data ?? []
    return submissions.map((s: any) => ({
      studentId: s.studentId,
      grade: s.grade,
      submittedAt: s.submittedAt ? s.submittedAt.split('T')[0] : null,
    }))
  })()

  // Initialize form when data is loaded
  useEffect(() => {
    if (!students || students.length === 0) return

    const gradesMap = new Map(
      (existingGrades || []).map((g) => [g.studentId, g])
    )

    const formGrades: StudentGrade[] = students.map((student: Student) => {
      const existing = gradesMap.get(student.id)
      return {
        studentId: student.id,
        name: student.user?.name || 'Nome não disponível',
        grade: existing?.grade ?? null,
        submittedAt: existing?.submittedAt ?? today,
      }
    })

    form.setValue('grades', formGrades)
  }, [students, existingGrades, form, today])

  const saveMutation = useBatchSaveGrades()

  const grades = form.watch('grades')
  const isLoading = isLoadingStudents || isLoadingGrades

  if (isLoading) {
    return <LaunchGradesModalSkeleton />
  }

  if (!grades || grades.length === 0) {
    return <LaunchGradesModalEmpty />
  }

  async function onSubmit(data: FormValues) {
    const gradesWithValues = data.grades.filter((g) => g.grade !== null)

    if (gradesWithValues.length === 0) {
      toast.error('Adicione pelo menos uma nota antes de salvar')
      return
    }

    try {
      await saveMutation.mutateAsync({
        assignmentId,
        grades: gradesWithValues.map((g) => ({
          studentId: g.studentId,
          grade: g.grade,
          submittedAt: g.submittedAt,
        })),
      })
      toast.success('Notas salvas com sucesso!')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao salvar notas')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-md bg-muted/50 p-3">
        <p className="text-sm text-muted-foreground">
          Preencha apenas os alunos que entregaram a atividade. Os campos vazios serão ignorados.
        </p>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {grades.map((student, index) => (
            <div
              key={student.studentId}
              className="flex items-center justify-between gap-4 rounded-md border p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{student.name}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Data</label>
                  <Input
                    type="date"
                    className="w-36"
                    value={student.submittedAt || ''}
                    onChange={(e) => {
                      form.setValue(`grades.${index}.submittedAt`, e.target.value || null)
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Nota</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={maxGrade}
                      step="0.1"
                      inputMode="decimal"
                      placeholder="0"
                      className="w-20 text-center"
                      value={student.grade ?? ''}
                      onChange={(e) => {
                        const grade = e.target.valueAsNumber
                        if (Number.isNaN(grade)) {
                          form.setValue(`grades.${index}.grade`, null)
                          return
                        }
                        form.setValue(`grades.${index}.grade`, grade)
                      }}
                    />
                    <span className="text-sm text-muted-foreground">/ {maxGrade}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saveMutation.isPending} className="gap-2">
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Notas
        </Button>
      </DialogFooter>
    </form>
  )
}

export function LaunchGradesModal({
  open,
  onOpenChange,
  assignmentName,
  maxGrade,
  classId,
  courseId,
  academicPeriodId,
  assignmentId,
}: LaunchGradesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{assignmentName}</DialogTitle>
          <DialogDescription>
            Lançar notas para esta atividade. Nota máxima: {maxGrade}
          </DialogDescription>
        </DialogHeader>

        <ErrorBoundary>
          <LaunchGradesModalContent
            assignmentId={assignmentId}
            assignmentName={assignmentName}
            maxGrade={maxGrade}
            classId={classId}
            courseId={courseId}
            academicPeriodId={academicPeriodId}
            onOpenChange={onOpenChange}
          />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}
