import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save, Users } from 'lucide-react'
import { tuyau } from '~/lib/api'

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
import { Checkbox } from '~/components/ui/checkbox'
import { ErrorBoundary } from '~/components/error-boundary'
import { useClassStudentsQueryOptions } from '~/hooks/queries/use_class_students'
import { useExamGradesQueryOptions } from '~/hooks/queries/use_exam_grades'

interface LaunchExamGradesModalProps {
  examId: string
  examTitle: string
  maxScore: number
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
  score: number | null
  absent: boolean
}

const schema = z.object({
  grades: z.array(
    z.object({
      studentId: z.string(),
      name: z.string(),
      score: z.number().min(0).nullable(),
      absent: z.boolean(),
    })
  ),
})

type FormValues = z.infer<typeof schema>

interface SaveGradePayload {
  examId: string
  studentId: string
  score: number
  absent: boolean
}

async function batchSaveExamGrades(examId: string, grades: SaveGradePayload[]): Promise<void> {
  await tuyau
    .$route('api.v1.exams.batchSaveGrades', { id: examId })
    .$post({
      grades: grades.map((g) => ({
        studentId: g.studentId,
        score: g.score,
        absent: g.absent,
      })),
    })
    .unwrap()
}

function LaunchExamGradesModalSkeleton() {
  return (
    <div className="py-12 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Carregando alunos...</p>
    </div>
  )
}

function LaunchExamGradesModalEmpty() {
  return (
    <div className="py-12 text-center">
      <Users className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Nenhum aluno encontrado</p>
    </div>
  )
}

function LaunchExamGradesModalContent({
  examId,
  maxScore,
  classId,
  courseId,
  academicPeriodId,
  onOpenChange,
}: Omit<LaunchExamGradesModalProps, 'open'>) {
  const queryClient = useQueryClient()

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

  const { data: examGradesResponse, isLoading: isLoadingGrades } = useQuery(
    useExamGradesQueryOptions({ examId, limit: 1000 })
  )

  const existingGrades = (() => {
    if (!examGradesResponse) return []
    const grades = examGradesResponse ?? []
    return grades.map((g: any) => ({
      studentId: g.studentId,
      score: g.score,
      attended: g.attended,
    }))
  })()

  // Initialize form when data is loaded
  useEffect(() => {
    if (!students || students.length === 0) return

    const gradesMap = new Map((existingGrades || []).map((g) => [g.studentId, g]))

    const formGrades: StudentGrade[] = students.map((student: Student) => {
      const existing = gradesMap.get(student.id)
      return {
        studentId: student.id,
        name: student.user?.name || 'Nome não disponível',
        score: existing?.score ?? null,
        absent: existing ? !existing.attended : false,
      }
    })

    form.setValue('grades', formGrades)
  }, [students, existingGrades, form])

  const saveMutation = useMutation({
    mutationFn: async (grades: SaveGradePayload[]) => {
      // Save all grades in a single batch request
      await batchSaveExamGrades(examId, grades)
    },
    onSuccess: () => {
      toast.success('Notas salvas com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      queryClient.invalidateQueries({ queryKey: ['exam-grades', examId] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar notas')
    },
  })

  const grades = form.watch('grades')
  const isLoading = isLoadingStudents || isLoadingGrades

  if (isLoading) {
    return <LaunchExamGradesModalSkeleton />
  }

  if (!grades || grades.length === 0) {
    return <LaunchExamGradesModalEmpty />
  }

  function onSubmit(data: FormValues) {
    const gradesToSave = data.grades
      .filter((g) => g.score !== null || g.absent)
      .map((g) => ({
        examId,
        studentId: g.studentId,
        score: g.absent ? 0 : (g.score ?? 0),
        absent: g.absent,
      }))

    if (gradesToSave.length === 0) {
      toast.error('Adicione pelo menos uma nota antes de salvar')
      return
    }

    saveMutation.mutate(gradesToSave)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-md bg-muted/50 p-3">
        <p className="text-sm text-muted-foreground">
          Preencha as notas dos alunos. Marque "Faltou" para alunos ausentes.
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
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`absent-${student.studentId}`}
                    checked={student.absent}
                    onCheckedChange={(checked) => {
                      form.setValue(`grades.${index}.absent`, !!checked)
                      if (checked) {
                        form.setValue(`grades.${index}.score`, 0)
                      }
                    }}
                  />
                  <label
                    htmlFor={`absent-${student.studentId}`}
                    className="text-sm text-muted-foreground"
                  >
                    Faltou
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={maxScore}
                    step="0.1"
                    inputMode="decimal"
                    placeholder="0"
                    className="w-20 text-center"
                    disabled={student.absent}
                    value={student.score ?? ''}
                    onChange={(e) => {
                      const score = e.target.valueAsNumber
                      if (Number.isNaN(score)) {
                        form.setValue(`grades.${index}.score`, null)
                        return
                      }
                      form.setValue(`grades.${index}.score`, score)
                    }}
                  />
                  <span className="text-sm text-muted-foreground">/ {maxScore}</span>
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

export function LaunchExamGradesModal({
  open,
  onOpenChange,
  examTitle,
  maxScore,
  examId,
  classId,
  courseId,
  academicPeriodId,
}: LaunchExamGradesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{examTitle}</DialogTitle>
          <DialogDescription>
            Lancar notas para esta prova. Nota maxima: {maxScore}
          </DialogDescription>
        </DialogHeader>

        <ErrorBoundary>
          <LaunchExamGradesModalContent
            examId={examId}
            examTitle={examTitle}
            maxScore={maxScore}
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
