import { useState } from 'react'
import { format, isAfter, isBefore, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ClipboardList, Trash2, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { LaunchGradesModal } from './launch-grades-modal'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { Route } from '@tuyau/core/types'

interface AssignmentsTableProps {
  classId: string
  courseId: string
  academicPeriodId: string
}

type AssignmentsResponse = Route.Response<'api.v1.assignments.index'>
type Assignment = AssignmentsResponse['data'][number]

function AssignmentsTableSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function AssignmentsTableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhuma atividade</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Não há atividades cadastradas para esta turma.
      </p>
    </div>
  )
}

export function AssignmentsTable({ classId, courseId, academicPeriodId }: AssignmentsTableProps) {
  const [page, setPage] = useState(1)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery(
    api.api.v1.assignments.index.queryOptions({
      query: { classId, academicPeriodId, page, limit: 10 },
    })
  )

  const queryClient = useQueryClient()
  const deleteMutation = useMutation(
    api.api.v1.assignments.destroy.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: api.api.v1.assignments.index.pathKey() })
      },
    })
  )

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) {
      return
    }
    try {
      await deleteMutation.mutateAsync({ params: { id: assignmentId } })
      toast.success('Atividade excluida com sucesso!')
    } catch {
      toast.error('Erro ao excluir atividade')
    }
  }

  if (isLoading) {
    return <AssignmentsTableSkeleton />
  }

  if (isError || !response) {
    return <div className="text-center text-destructive py-8">Erro ao carregar atividades</div>
  }

  const assignments = response.data
  const meta = response.metadata

  if (assignments.length === 0) {
    return <AssignmentsTableEmpty />
  }

  function getStatus(dueDate: string) {
    const date = new Date(dueDate)
    if (isAfter(date, new Date())) {
      return { label: 'Esperando entregas', variant: 'secondary' as const }
    }
    if (isToday(date) || isBefore(date, new Date())) {
      return { label: 'Finalizado', variant: 'default' as const }
    }
    return { label: 'Pendente', variant: 'outline' as const }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atividade</TableHead>
            <TableHead>Matéria</TableHead>
            <TableHead>Data de entrega</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => {
            const status = getStatus(assignment.dueDate ?? '')
            const hasGrades = (assignment.submissionsCount ?? 0) > 0

            return (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.name}</TableCell>
                <TableCell>{assignment.teacherHasClass?.subject?.name || '-'}</TableCell>
                <TableCell>
                  {format(new Date(assignment.dueDate ?? ''), "dd 'de' MMMM", { locale: ptBR })}
                </TableCell>
                <TableCell>{assignment.grade}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setSelectedAssignment(assignment)}
                    >
                      <ClipboardList className="h-4 w-4" />
                      <span>Lançar Notas</span>
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(assignment.id)}
                              disabled={hasGrades || deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {hasGrades && (
                          <TooltipContent>
                            <p>
                              Não é possível excluir. Existem {assignment.submissionsCount ?? 0}{' '}
                              nota(s) lançada(s).
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

      {/* Pagination */}
      {meta && meta.lastPage && Number(meta.lastPage) > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {Number(meta.currentPage)} de {Number(meta.lastPage)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Number(meta.lastPage ?? 0)}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {/* Launch Grades Modal */}
      {selectedAssignment && (
        <LaunchGradesModal
          assignmentId={selectedAssignment.id}
          assignmentName={selectedAssignment.name}
          maxGrade={selectedAssignment.grade}
          classId={classId}
          courseId={courseId}
          academicPeriodId={academicPeriodId}
          open={!!selectedAssignment}
          onOpenChange={(open) => {
            if (!open) setSelectedAssignment(null)
          }}
        />
      )}
    </div>
  )
}
