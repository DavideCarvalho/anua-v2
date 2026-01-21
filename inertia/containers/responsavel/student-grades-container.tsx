import { useSuspenseQuery } from '@tanstack/react-query'
import { BookOpen, TrendingUp, Clock, CheckCircle } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

import { useStudentGradesQueryOptions } from '../../hooks/queries/use-student-grades'

interface StudentGradesContainerProps {
  studentId: string
  studentName: string
}

export function StudentGradesContainer({ studentId, studentName }: StudentGradesContainerProps) {
  const { data } = useSuspenseQuery(useStudentGradesQueryOptions(studentId))

  const getGradeColor = (average: number) => {
    if (average >= 7) return 'text-green-600'
    if (average >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GRADED':
        return <Badge variant="default">Avaliado</Badge>
      case 'PENDING':
        return <Badge variant="secondary">Pendente</Badge>
      case 'SUBMITTED':
        return <Badge variant="outline">Enviado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de {studentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className={cn('text-3xl font-bold', getGradeColor(data.summary.overallAverage))}>
                {data.summary.overallAverage.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Media Geral</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{data.summary.totalScore}</p>
              <p className="text-sm text-muted-foreground">Pontos Obtidos</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{data.summary.maxPossibleScore}</p>
              <p className="text-sm text-muted-foreground">Pontos Possiveis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades by Subject */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Notas por Materia
          </CardTitle>
          <CardDescription>Desempenho em cada disciplina</CardDescription>
        </CardHeader>
        <CardContent>
          {data.bySubject.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma nota registrada ainda
            </div>
          ) : (
            <div className="space-y-4">
              {data.bySubject.map((subject: any) => (
                <div
                  key={subject.subjectId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{subject.subjectName}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.gradedCount} de {subject.assignmentsCount} atividades avaliadas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-2xl font-bold', getGradeColor(subject.average))}>
                      {subject.average.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subject.totalScore}/{subject.maxPossibleScore} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
          <CardDescription>Ultimas atividades e avaliacoes</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentAssignments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma atividade recente
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead className="text-center">Nota</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAssignments.map((assignment: any) => (
                  <TableRow key={assignment.assignmentId}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.subjectName}</TableCell>
                    <TableCell className="text-center">
                      {assignment.score !== null ? (
                        <span className={getGradeColor((assignment.score / assignment.maxScore) * 10)}>
                          {assignment.score}/{assignment.maxScore}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(assignment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function StudentGradesContainerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
