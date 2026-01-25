import { useState } from 'react'
import { usePage } from '@inertiajs/react'
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
import type { SharedProps } from '../../lib/types'

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

export function GamificationEventsTable() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: events } = useGamificationEvents({
    status: statusFilter !== 'all' ? (statusFilter as 'PENDING' | 'PROCESSED' | 'FAILED') : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    page,
    limit: 15,
  })

  const retryEvent = useRetryGamificationEvent()

  const eventsList = events?.data || []
  const meta = events?.meta

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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                    onClick={() => setPage(page - 1)}
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
                    onClick={() => setPage(page + 1)}
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
