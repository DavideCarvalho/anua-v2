import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useGamificationEvents } from '../../hooks/queries/use_gamification_events'
import { useRetryGamificationEvent } from '../../hooks/mutations/use_gamification_event_mutations'

const EVENT_TYPES = [
  { value: 'ATTENDANCE', label: 'Presenca' },
  { value: 'GRADE', label: 'Nota' },
  { value: 'ASSIGNMENT', label: 'Atividade' },
  { value: 'BEHAVIOR', label: 'Comportamento' },
  { value: 'ACHIEVEMENT', label: 'Conquista' },
  { value: 'CUSTOM', label: 'Personalizado' },
]

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PROCESSED: { label: 'Processado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  FAILED: { label: 'Falhou', color: 'bg-red-100 text-red-700', icon: XCircle },
}

function GamificationEventsErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Erro ao carregar eventos</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

export function GamificationEventsTable() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <GamificationEventsErrorFallback error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <GamificationEventsTableContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function GamificationEventsTableContent() {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    status: parseAsString.withDefault('all'),
    type: parseAsString.withDefault('all'),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(15),
  })

  const { status: statusFilter, type: typeFilter, page, limit } = filters

  const { data: events } = useGamificationEvents({
    status: statusFilter !== 'all' ? (statusFilter as 'PENDING' | 'PROCESSED' | 'FAILED') : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    page,
    limit,
  })

  const retryEvent = useRetryGamificationEvent()

  const eventsList = (events as any)?.data || []
  const meta = (events as any)?.meta

  const handleRetry = async (id: string) => {
    await retryEvent.mutateAsync(id)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Eventos de Gamificacao
            </CardTitle>
            <CardDescription>
              Historico de eventos que geram pontos e conquistas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(value) => setFilters({ status: value, page: 1 })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PROCESSED">Processado</SelectItem>
              <SelectItem value="FAILED">Falhou</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) => setFilters({ type: value, page: 1 })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {eventsList.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Zap className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-2">Nenhum evento encontrado</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Pontos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[80px]">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsList.map((event: any) => {
                  const status = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
                  const StatusIcon = status.icon
                  const typeLabel = EVENT_TYPES.find((t) => t.value === event.eventType)?.label || event.eventType

                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-medium">
                            {event.student?.user?.name || 'Aluno'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabel}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {event.pointsAwarded > 0 ? `+${event.pointsAwarded}` : event.pointsAwarded || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(event.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {event.status === 'FAILED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRetry(event.id)}
                            disabled={retryEvent.isPending}
                          >
                            {retryEvent.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {meta && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {eventsList.length} de {meta.total} eventos
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setFilters({ page: page - 1 })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Pagina {page} de {meta.lastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.lastPage}
                    onClick={() => setFilters({ page: page + 1 })}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
