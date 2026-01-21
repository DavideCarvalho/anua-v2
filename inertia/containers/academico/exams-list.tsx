import { useSuspenseQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ClipboardList, Calendar, Clock, Edit, Trash2, Eye } from 'lucide-react'

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

import { useExamsQueryOptions } from '../../hooks/queries/use-exams'

interface ExamsListProps {
  classId?: string
  subjectId?: string
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ExamsList({ classId, subjectId, onView, onEdit, onDelete }: ExamsListProps) {
  const { data } = useSuspenseQuery(useExamsQueryOptions({ classId, subjectId }))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="secondary">Agendada</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default">Em andamento</Badge>
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Concluida
          </Badge>
        )
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelada</Badge>
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

  if (!data.data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma prova encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">Crie uma nova prova para comecar.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Provas e Avaliacoes
        </CardTitle>
        <CardDescription>Lista de provas e avaliacoes</CardDescription>
      </CardHeader>
      <CardContent>
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
            {data.data.map((exam: any) => (
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
                    {format(new Date(exam.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell className="text-center">{getStatusBadge(exam.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <Button variant="ghost" size="sm" onClick={() => onView(exam.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(exam.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => onDelete(exam.id)}
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

export function ExamsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
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
