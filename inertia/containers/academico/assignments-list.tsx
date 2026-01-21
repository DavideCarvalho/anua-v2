import { useSuspenseQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, Calendar, Users, CheckCircle, Clock, Edit, Trash2, Eye } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
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

import { useAssignmentsQueryOptions } from '../../hooks/queries/use-assignments'

interface AssignmentsListProps {
  classId?: string
  subjectId?: string
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AssignmentsList({
  classId,
  subjectId,
  onView,
  onEdit,
  onDelete,
}: AssignmentsListProps) {
  const { data } = useSuspenseQuery(useAssignmentsQueryOptions({ classId, subjectId }))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="default">Publicada</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'ARCHIVED':
        return <Badge variant="outline">Arquivada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()

  if (!data.data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma atividade encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie uma nova atividade para comecar.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Atividades
        </CardTitle>
        <CardDescription>Lista de atividades e tarefas</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titulo</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead>Materia</TableHead>
              <TableHead className="text-center">Pontuacao</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((assignment: any) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.title}</TableCell>
                <TableCell>{assignment.class?.name || '-'}</TableCell>
                <TableCell>{assignment.subject?.name || '-'}</TableCell>
                <TableCell className="text-center">{assignment.maxScore} pts</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={cn(
                        isOverdue(assignment.dueDate) && assignment.status === 'PUBLISHED'
                          ? 'text-red-500'
                          : ''
                      )}
                    >
                      {format(new Date(assignment.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{getStatusBadge(assignment.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <Button variant="ghost" size="sm" onClick={() => onView(assignment.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(assignment.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => onDelete(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function AssignmentsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
