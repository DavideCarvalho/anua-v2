import { useQuery } from '@tanstack/react-query'
import { BookOpen, TrendingUp, Clock, XCircle } from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'

type StudentGradesResponse = Route.Response<'api.v1.responsavel.api.student_grades'>

type SubjectGrade = StudentGradesResponse['bySubject'][number]
type RecentAssignment = StudentGradesResponse['recentAssignments'][number]

interface StudentGradesContainerProps {
  studentId: string
  studentName: string
}

export function StudentGradesContainer({ studentId, studentName }: StudentGradesContainerProps) {
  const { data, isLoading, isError, error } = useQuery(
    api.api.v1.responsavel.api.studentGrades.queryOptions({ params: { studentId } })
  )

  if (isLoading) {
    return <StudentGradesContainerSkeleton />
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar notas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return <StudentGradesContainerSkeleton />
  }

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

  const getSubPeriodStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default">Aprovado</Badge>
      case 'IN_RECOVERY':
        return <Badge variant="secondary">Em Recuperacao</Badge>
      case 'RECOVERED':
        return <Badge variant="outline">Recuperado</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Reprovado</Badge>
      default:
        return <Badge variant="secondary">Sem nota</Badge>
    }
  }

  const renderSubjectGrades = (subjects: SubjectGrade[]) => (
    <div className="space-y-4">
      {subjects.map((subject: SubjectGrade) => {
        const subPeriodGrades = (subject as any).subPeriodGrades as
          | Array<{
              subPeriodId: string
              subPeriodName: string
              order: number
              grade: number | null
              recoveryGrade: number | null
              finalGrade: number | null
              weight: number
              minimumGrade: number
              hasRecovery: boolean
              status: string
            }>
          | undefined

        if (subPeriodGrades && subPeriodGrades.length > 0) {
          return (
            <div key={subject.subjectId} className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted/50">
                <p className="font-medium">{subject.subjectName}</p>
                <p className="text-sm text-muted-foreground">
                  {subject.gradedCount} de {subject.assignmentsCount} atividades avaliadas
                </p>
              </div>
              <Tabs defaultValue="summary">
                <div className="px-4 pt-2">
                  <TabsList>
                    <TabsTrigger value="summary">Resumo</TabsTrigger>
                    {subPeriodGrades
                      .sort((a, b) => a.order - b.order)
                      .map((sp) => (
                        <TabsTrigger key={sp.subPeriodId} value={sp.subPeriodId}>
                          {sp.subPeriodName}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </div>
                <TabsContent value="summary" className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Media Ponderada Final</p>
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
                </TabsContent>
                {subPeriodGrades.map((sp) => (
                  <TabsContent key={sp.subPeriodId} value={sp.subPeriodId} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Nota do Periodo</p>
                          {sp.recoveryGrade !== null && (
                            <p className="text-xs text-muted-foreground">
                              Recuperacao: {sp.recoveryGrade.toFixed(1)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              'text-xl font-bold',
                              sp.finalGrade !== null
                                ? getGradeColor(sp.finalGrade)
                                : 'text-muted-foreground'
                            )}
                          >
                            {sp.finalGrade !== null ? sp.finalGrade.toFixed(1) : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Nota minima: {sp.minimumGrade}
                        </span>
                        {getSubPeriodStatusBadge(sp.status)}
                      </div>
                      {sp.hasRecovery && sp.status === 'IN_RECOVERY' && (
                        <p className="text-sm text-yellow-600">Aguardando nota de recuperacao</p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )
        }

        return (
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
        )
      })}
    </div>
  )

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
            renderSubjectGrades(data.bySubject)
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
            <div className="py-8 text-center text-muted-foreground">Nenhuma atividade recente</div>
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
                {data.recentAssignments.map((assignment: RecentAssignment) => (
                  <TableRow key={assignment.assignmentId}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.subjectName}</TableCell>
                    <TableCell className="text-center">
                      {assignment.score !== null ? (
                        <span
                          className={getGradeColor((assignment.score / assignment.maxScore) * 10)}
                        >
                          {assignment.score}/{assignment.maxScore}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(assignment.status)}
                    </TableCell>
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
