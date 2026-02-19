import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Eye,
  Bell,
  Heart,
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
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'

import {
  useStudentOccurrencesQueryOptions,
  type StudentOccurrencesResponse,
} from '../../hooks/queries/use_student_occurrences'
import { useAcknowledgeOccurrence } from '../../hooks/mutations/use_acknowledge_occurrence'
import { brazilianDateFormatter } from '../../lib/formatters'

type Occurrence = StudentOccurrencesResponse['occurrences'][number]

interface StudentOccurrencesContainerProps {
  studentId: string
  studentName: string
}

const TYPE_CONFIG = {
  BEHAVIOR: { label: 'Comportamento', icon: AlertTriangle, color: 'text-foreground' },
  PERFORMANCE: { label: 'Desempenho', icon: Info, color: 'text-primary' },
  ABSENCE: { label: 'Falta', icon: AlertCircle, color: 'text-destructive' },
  LATE: { label: 'Atraso', icon: Clock, color: 'text-muted-foreground' },
  PRAISE: { label: 'Elogio ao aluno', icon: Heart, color: 'text-emerald-600' },
  OTHER: { label: 'Outro', icon: Info, color: 'text-muted-foreground' },
}

const STATUS_CONFIG = {
  OPEN: { label: 'Aberta', icon: AlertCircle, variant: 'secondary' as const },
  IN_PROGRESS: { label: 'Em andamento', icon: Clock, variant: 'outline' as const },
  RESOLVED: { label: 'Resolvida', icon: CheckCircle2, variant: 'default' as const },
  DISMISSED: { label: 'Arquivada', icon: XCircle, variant: 'outline' as const },
}

export function StudentOccurrencesContainer({
  studentId,
  studentName,
}: StudentOccurrencesContainerProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const { data, isLoading, isError, error } = useQuery(
    useStudentOccurrencesQueryOptions(studentId, {
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      severity: severityFilter === 'all' ? undefined : severityFilter,
    })
  )

  const acknowledgeMutation = useAcknowledgeOccurrence()

  if (isLoading) {
    return <StudentOccurrencesContainerSkeleton />
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar registros diarios</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return <StudentOccurrencesContainerSkeleton />
  }

  const hasUnacknowledged = data.summary.unacknowledged > 0
  const hasOccurrences = data.occurrences.length > 0

  const handleAcknowledge = (occurrenceId: string) => {
    acknowledgeMutation.mutate({ studentId, occurrenceId })
  }

  return (
    <div className="space-y-6">
      {/* Alert for unacknowledged records */}
      {hasUnacknowledged && (
        <Alert variant="destructive">
          <Bell className="h-4 w-4" />
          <AlertTitle>Atencao</AlertTitle>
          <AlertDescription>
            Existem {data.summary.unacknowledged} registro
            {data.summary.unacknowledged > 1 ? 's' : ''} pendente
            {data.summary.unacknowledged > 1 ? 's' : ''} de reconhecimento.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
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
              <div className="p-2 rounded-lg bg-muted">
                <AlertCircle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.open}</p>
                <p className="text-sm text-muted-foreground">Abertas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.inProgress}</p>
                <p className="text-sm text-muted-foreground">Em andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolvidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertOctagon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.summary.critical + data.summary.high}</p>
                <p className="text-sm text-muted-foreground">Alta/Critica</p>
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

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="BEHAVIOR">Comportamento</SelectItem>
                <SelectItem value="PERFORMANCE">Desempenho</SelectItem>
                <SelectItem value="ABSENCE">Falta</SelectItem>
                <SelectItem value="LATE">Atraso</SelectItem>
                <SelectItem value="PRAISE">Elogio ao aluno</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="OPEN">Aberta</SelectItem>
                <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                <SelectItem value="RESOLVED">Resolvida</SelectItem>
                <SelectItem value="DISMISSED">Arquivada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Gravidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="CRITICAL">Critica</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Occurrences List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Registro diario de {studentName}
          </CardTitle>
          <CardDescription>
            {hasOccurrences
              ? `${data.occurrences.length} registro${data.occurrences.length > 1 ? 's' : ''} encontrado${data.occurrences.length > 1 ? 's' : ''}`
              : 'Nenhum registro diario registrado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasOccurrences ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum registro diario</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {typeFilter !== 'all' || statusFilter !== 'all' || severityFilter !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Ótimo! Não há ocorrências registradas para este aluno'}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {data.occurrences.map((occurrence: Occurrence) => {
                const typeConfig = TYPE_CONFIG[occurrence.type as keyof typeof TYPE_CONFIG]
                const statusConfig = STATUS_CONFIG[occurrence.status as keyof typeof STATUS_CONFIG]
                const TypeIcon = typeConfig?.icon || Info
                const StatusIcon = statusConfig?.icon || AlertCircle

                const needsAcknowledgment =
                  occurrence.responsibleNotified && !occurrence.responsibleAcknowledged

                return (
                  <AccordionItem
                    key={occurrence.id}
                    value={occurrence.id}
                    className={cn(
                      'border rounded-lg px-4',
                      needsAcknowledgment && 'border-primary/30 bg-primary/5'
                    )}
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-1 items-center justify-between pr-4">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <TypeIcon className={cn('h-4 w-4', typeConfig?.color)} />
                            <span className="font-medium text-left">{occurrence.title}</span>
                            {needsAcknowledgment && (
                              <Badge variant="secondary">
                                <Eye className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={statusConfig?.variant ?? 'outline'}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig?.label}
                            </Badge>
                            <span>{brazilianDateFormatter(occurrence.occurrenceDate)}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4 pt-2">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Descricao</h4>
                          <p className="mt-1 text-sm whitespace-pre-wrap">
                            {occurrence.description}
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Tipo</h4>
                            <p className="mt-1 text-sm">{typeConfig?.label}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Reportado por
                            </h4>
                            <p className="mt-1 text-sm">{occurrence.reporterName}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Data do registro
                            </h4>
                            <p className="mt-1 text-sm">
                              {brazilianDateFormatter(occurrence.occurrenceDate)}
                            </p>
                          </div>
                        </div>

                        {occurrence.resolutionNotes && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <h4 className="text-sm font-medium text-primary">Resolucao</h4>
                            <p className="mt-1 text-sm text-foreground">
                              {occurrence.resolutionNotes}
                            </p>
                            {occurrence.resolverName && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Resolvido por {occurrence.resolverName} em{' '}
                                {brazilianDateFormatter(String(occurrence.resolvedAt))}
                              </p>
                            )}
                          </div>
                        )}

                        {needsAcknowledgment && (
                          <div className="flex justify-end pt-2">
                            <Button
                              onClick={() => handleAcknowledge(occurrence.id)}
                              disabled={acknowledgeMutation.isPending}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {acknowledgeMutation.isPending
                                ? 'Reconhecendo...'
                                : 'Reconhecer registro'}
                            </Button>
                          </div>
                        )}

                        {occurrence.responsibleAcknowledged && (
                          <p className="text-xs text-muted-foreground text-right">
                            Reconhecido em{' '}
                            {brazilianDateFormatter(String(occurrence.responsibleAcknowledgedAt))}
                          </p>
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

export function StudentOccurrencesContainerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
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
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-40" />
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
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
