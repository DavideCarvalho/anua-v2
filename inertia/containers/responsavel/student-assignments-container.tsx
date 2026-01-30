import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Filter,
  XCircle,
} from 'lucide-react'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'

import {
  useStudentAssignmentsQueryOptions,
  type StudentAssignmentsResponse,
} from '../../hooks/queries/use_student_assignments'
import { brazilianDateFormatter } from '../../lib/formatters'

type Subject = StudentAssignmentsResponse['subjects'][number]
type Assignment = StudentAssignmentsResponse['assignments'][number]

interface StudentAssignmentsContainerProps {
  studentId: string
  studentName: string
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas', icon: FileText },
  { value: 'pending', label: 'Pendentes', icon: Clock },
  { value: 'completed', label: 'Avaliadas', icon: CheckCircle2 },
  { value: 'late', label: 'Atrasadas', icon: AlertCircle },
]

export function StudentAssignmentsContainer({
  studentId,
  studentName,
}: StudentAssignmentsContainerProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  const { data, isLoading, isError, error } = useQuery(
    useStudentAssignmentsQueryOptions(studentId, {
      status: statusFilter === 'all' ? undefined : statusFilter,
      subjectId: subjectFilter === 'all' ? undefined : subjectFilter,
    })
  )

  if (isLoading) {
    return <StudentAssignmentsContainerSkeleton />
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar atividades</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return <StudentAssignmentsContainerSkeleton />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Avaliada
          </Badge>
        )
      case 'submitted':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            Enviada
          </Badge>
        )
      case 'overdue':
      case 'late':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Atrasada
          </Badge>
        )
      case 'not_submitted':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        )
    }
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: brazilianDateFormatter(dateString), isOverdue: true }
    }
    if (diffDays === 0) {
      return { text: 'Hoje', isOverdue: false }
    }
    if (diffDays === 1) {
      return { text: 'Amanha', isOverdue: false }
    }
    if (diffDays <= 7) {
      return { text: `Em ${diffDays} dias`, isOverdue: false }
    }
    return { text: brazilianDateFormatter(dateString), isOverdue: false }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.pending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.completed}</p>
                <p className="text-sm text-muted-foreground">Avaliadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.overdue}</p>
                <p className="text-sm text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                  className="gap-1"
                >
                  <filter.icon className="h-3 w-3" />
                  {filter.label}
                </Button>
              ))}
            </div>

            {data.subjects.length > 0 && (
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as materias</SelectItem>
                  {data.subjects.map((subject: Subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Atividades de {studentName}
          </CardTitle>
          <CardDescription>
            {data.assignments.length} atividade{data.assignments.length !== 1 ? 's' : ''}{' '}
            encontrada{data.assignments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.assignments.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma atividade encontrada</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {statusFilter !== 'all' || subjectFilter !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Ainda nao ha atividades para este aluno'}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {data.assignments.map((assignment: Assignment) => {
                const dueInfo = formatDueDate(String(assignment.dueDate))
                return (
                  <AccordionItem
                    key={assignment.id}
                    value={assignment.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-1 items-center justify-between pr-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-medium text-left">{assignment.title}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{assignment.subject.name}</Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className={cn(dueInfo.isOverdue && 'text-red-600')}>
                                {dueInfo.text}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {assignment.submission?.score !== undefined &&
                            assignment.submission?.score !== null && (
                              <span
                                className={cn(
                                  'text-lg font-bold',
                                  assignment.submission.score / assignment.maxScore >= 0.7
                                    ? 'text-green-600'
                                    : assignment.submission.score / assignment.maxScore >= 0.5
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                )}
                              >
                                {assignment.submission.score}/{assignment.maxScore}
                              </span>
                            )}
                          {getStatusBadge(assignment.computedStatus)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4 pt-2">
                        {assignment.description && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Descricao</h4>
                            <p className="mt-1 text-sm">{assignment.description}</p>
                          </div>
                        )}

                        {assignment.instructions && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Instrucoes
                            </h4>
                            <p className="mt-1 text-sm whitespace-pre-wrap">
                              {assignment.instructions}
                            </p>
                          </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Professor</h4>
                            <p className="mt-1 text-sm">{assignment.teacher.name}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Pontuacao Maxima
                            </h4>
                            <p className="mt-1 text-sm">{assignment.maxScore} pontos</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Data de Entrega
                            </h4>
                            <p className="mt-1 text-sm">
                              {brazilianDateFormatter(String(assignment.dueDate))}
                            </p>
                          </div>
                        </div>

                        {assignment.submission?.feedback && (
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="text-sm font-medium">Feedback do Professor</h4>
                            <p className="mt-1 text-sm">{assignment.submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function StudentAssignmentsContainerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-16 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
