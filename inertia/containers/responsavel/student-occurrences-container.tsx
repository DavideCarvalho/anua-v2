import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
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

import { useStudentOccurrencesQueryOptions } from '../../hooks/queries/use-student-occurrences'
import { useAcknowledgeOccurrence } from '../../hooks/mutations/use-acknowledge-occurrence'
import { brazilianDateFormatter } from '../../lib/formatters'

interface StudentOccurrencesContainerProps {
  studentId: string
  studentName: string
}

const TYPE_CONFIG = {
  BEHAVIORAL: { label: 'Comportamental', icon: AlertTriangle, color: 'text-yellow-600' },
  ACADEMIC: { label: 'Academica', icon: Info, color: 'text-blue-600' },
  HEALTH: { label: 'Saude', icon: AlertCircle, color: 'text-red-600' },
  ATTENDANCE: { label: 'Frequencia', icon: Clock, color: 'text-purple-600' },
  OTHER: { label: 'Outro', icon: Info, color: 'text-gray-600' },
}

const SEVERITY_CONFIG = {
  LOW: { label: 'Baixa', className: 'bg-green-100 text-green-700 border-green-200' },
  MEDIUM: { label: 'Media', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  CRITICAL: { label: 'Critica', className: 'bg-red-100 text-red-700 border-red-200' },
}

const STATUS_CONFIG = {
  OPEN: { label: 'Aberta', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-700' },
  IN_PROGRESS: { label: 'Em andamento', icon: Clock, className: 'bg-blue-100 text-blue-700' },
  RESOLVED: { label: 'Resolvida', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  DISMISSED: { label: 'Arquivada', icon: XCircle, className: 'bg-gray-100 text-gray-700' },
}

export function StudentOccurrencesContainer({
  studentId,
  studentName,
}: StudentOccurrencesContainerProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const { data } = useSuspenseQuery(
    useStudentOccurrencesQueryOptions(studentId, {
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      severity: severityFilter === 'all' ? undefined : severityFilter,
    })
  )

  const acknowledgeMutation = useAcknowledgeOccurrence()

  const hasUnacknowledged = data.summary.unacknowledged > 0
  const hasOccurrences = data.occurrences.length > 0

  const handleAcknowledge = (occurrenceId: string) => {
    acknowledgeMutation.mutate({ studentId, occurrenceId })
  }

  return (
    <div className="space-y-6">
      {/* Alert for unacknowledged occurrences */}
      {hasUnacknowledged && (
        <Alert variant="destructive">
          <Bell className="h-4 w-4" />
          <AlertTitle>Atencao</AlertTitle>
          <AlertDescription>
            Existem {data.summary.unacknowledged} ocorrencia
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
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
                <AlertCircle className="h-5 w-5 text-yellow-600" />
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
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
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertOctagon className="h-5 w-5 text-red-600" />
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
                <SelectItem value="BEHAVIORAL">Comportamental</SelectItem>
                <SelectItem value="ACADEMIC">Academica</SelectItem>
                <SelectItem value="HEALTH">Saude</SelectItem>
                <SelectItem value="ATTENDANCE">Frequencia</SelectItem>
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
            Ocorrencias de {studentName}
          </CardTitle>
          <CardDescription>
            {hasOccurrences
              ? `${data.occurrences.length} ocorrencia${data.occurrences.length > 1 ? 's' : ''} encontrada${data.occurrences.length > 1 ? 's' : ''}`
              : 'Nenhuma ocorrencia registrada'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasOccurrences ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma ocorrencia</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {typeFilter !== 'all' || statusFilter !== 'all' || severityFilter !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Otimo! Nao ha ocorrencias registradas para este aluno'}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {data.occurrences.map((occurrence: any) => {
                const typeConfig = TYPE_CONFIG[occurrence.type as keyof typeof TYPE_CONFIG]
                const severityConfig =
                  SEVERITY_CONFIG[occurrence.severity as keyof typeof SEVERITY_CONFIG]
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
                      needsAcknowledgment && 'border-yellow-300 bg-yellow-50'
                    )}
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-1 items-center justify-between pr-4">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <TypeIcon className={cn('h-4 w-4', typeConfig?.color)} />
                            <span className="font-medium text-left">{occurrence.title}</span>
                            {needsAcknowledgment && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                                <Eye className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className={severityConfig?.className}>
                              {severityConfig?.label}
                            </Badge>
                            <Badge variant="outline" className={statusConfig?.className}>
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
                          <p className="mt-1 text-sm whitespace-pre-wrap">{occurrence.description}</p>
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
                              Data da Ocorrencia
                            </h4>
                            <p className="mt-1 text-sm">
                              {brazilianDateFormatter(occurrence.occurrenceDate)}
                            </p>
                          </div>
                        </div>

                        {occurrence.resolutionNotes && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="text-sm font-medium text-green-800">
                              Resolucao
                            </h4>
                            <p className="mt-1 text-sm text-green-700">
                              {occurrence.resolutionNotes}
                            </p>
                            {occurrence.resolverName && (
                              <p className="mt-2 text-xs text-green-600">
                                Resolvido por {occurrence.resolverName} em{' '}
                                {brazilianDateFormatter(occurrence.resolvedAt)}
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
                                : 'Reconhecer Ocorrencia'}
                            </Button>
                          </div>
                        )}

                        {occurrence.responsibleAcknowledged && (
                          <p className="text-xs text-muted-foreground text-right">
                            Reconhecido em{' '}
                            {brazilianDateFormatter(occurrence.responsibleAcknowledgedAt)}
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
