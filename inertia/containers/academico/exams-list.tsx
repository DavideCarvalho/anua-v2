import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ClipboardList, Calendar, Trash2, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { useExamsQueryOptions } from '../../hooks/queries/use_exams'
import { LaunchExamGradesModal } from '../turma/launch-exam-grades-modal'

interface Exam {
  id: string
  title: string
  description: string | null
  scheduledDate: string
  maxScore: number
  type: string
  status: string
  classId: string
  academicPeriodId: string
  courseId: string | null
  class: { id: string; name: string } | null
  subject: { id: string; name: string } | null
  gradesCount: number
}

interface ExamsListProps {
  classId?: string
  subjectId?: string
}

async function deleteExam(examId: string): Promise<void> {
  const response = await fetch(`/api/v1/exams/${examId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao excluir prova')
  }
}

function ExamsListSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function ExamsListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhuma prova encontrada</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Crie uma nova prova para comecar.
      </p>
    </div>
  )
}

export function ExamsList({ classId, subjectId }: ExamsListProps) {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery(useExamsQueryOptions({ classId, subjectId }))

  const deleteMutation = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      toast.success('Prova excluida com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      setExamToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir prova')
    },
  })

  const handleDelete = () => {
    if (!examToDelete) return
    deleteMutation.mutate(examToDelete.id)
  }

  if (isLoading) {
    return <ExamsListSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="text-center text-destructive py-8">Erro ao carregar provas</div>
    )
  }

  const exams: Exam[] = (data?.data ?? []) as any

  if (exams.length === 0) {
    return <ExamsListEmpty />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="bg-muted/60 text-muted-foreground">
            Agendada
          </Badge>
        )
      case 'IN_PROGRESS':
        return <Badge variant="default">Em andamento</Badge>
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Concluida
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      WRITTEN: 'Escrita',
      ORAL: 'Oral',
      PRACTICAL: 'Pratica',
      PROJECT: 'Projeto',
      QUIZ: 'Quiz',
    }
    return types[type] || type
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titulo</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Materia</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
            <TableHead className="text-center">Pontuacao</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => {
            const hasGrades = exam.gradesCount > 0

            return (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>{exam.class?.name || '-'}</TableCell>
                <TableCell>{exam.subject?.name || '-'}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{getTypeBadge(exam.type)}</Badge>
                </TableCell>
                <TableCell className="text-center">{exam.maxScore} pts</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(exam.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell className="text-center">{getStatusBadge(exam.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (!exam.courseId) {
                          toast.error('Não foi possível identificar o curso da turma. Verifique se a turma está vinculada a um curso.')
                          return
                        }
                        setSelectedExam(exam)
                      }}
                    >
                      <ClipboardList className="h-4 w-4" />
                      <span>Lancar Notas</span>
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setExamToDelete(exam)}
                              disabled={hasGrades || deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {hasGrades && (
                          <TooltipContent>
                            <p>
                              Nao e possivel excluir. Existem {exam.gradesCount} nota(s) lancada(s).
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {selectedExam && selectedExam.courseId && (
        <LaunchExamGradesModal
          examId={selectedExam.id}
          examTitle={selectedExam.title}
          maxScore={selectedExam.maxScore}
          classId={selectedExam.classId}
          courseId={selectedExam.courseId}
          academicPeriodId={selectedExam.academicPeriodId}
          open={!!selectedExam}
          onOpenChange={(open) => {
            if (!open) setSelectedExam(null)
          }}
        />
      )}

      <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir prova</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a prova "{examToDelete?.title}"? Esta acao nao pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
