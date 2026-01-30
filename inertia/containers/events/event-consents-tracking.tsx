import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Clock, AlertCircle, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

import { useEventConsentsQueryOptions } from '../../hooks/queries/use_event_consents'

interface EventConsentsTrackingProps {
  eventId: string
}

type ConsentStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED'

type Consent = {
  id: string
  studentId: string
  responsibleId: string
  status: ConsentStatus
  notes: string | null
  requestedAt: string
  approvedAt: string | null
  deniedAt: string | null
  expiresAt: string | null
  student: {
    id: string
    name: string
    email: string
  }
  responsible: {
    id: string
    name: string
    email: string
  }
}

type Stats = {
  total: number
  pending: number
  approved: number
  denied: number
  expired: number
}

export function EventConsentsTracking({ eventId }: EventConsentsTrackingProps) {
  const [statusFilter, setStatusFilter] = useState<ConsentStatus | 'ALL'>('ALL')
  const { data } = useSuspenseQuery(
    useEventConsentsQueryOptions(eventId, statusFilter !== 'ALL' ? { status: statusFilter } : {})
  )

  const event = data.event
  const stats = data.stats as Stats
  const consents = data.consents as unknown as Consent[]

  const getStatusBadge = (status: ConsentStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Autorizado
          </Badge>
        )
      case 'DENIED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Negado
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expirado
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Event info */}
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            {format(new Date(String(event.startDate)), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de solicitações</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Autorizados</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
            <p className="text-xs text-muted-foreground">Negados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">Expirados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Autorizações
              </CardTitle>
              <CardDescription>Status das autorizações parentais para este evento</CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ConsentStatus | 'ALL')}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="APPROVED">Autorizados</SelectItem>
                <SelectItem value="DENIED">Negados</SelectItem>
                <SelectItem value="EXPIRED">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {consents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {statusFilter === 'ALL'
                  ? 'Nenhuma solicitação de autorização'
                  : 'Nenhuma solicitação com este status'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {statusFilter === 'ALL'
                  ? 'Ainda não foram enviadas solicitações de autorização para este evento.'
                  : 'Não há solicitações com o filtro selecionado.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de resposta</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{consent.student.name}</p>
                        <p className="text-xs text-muted-foreground">{consent.student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{consent.responsible.name}</p>
                        <p className="text-xs text-muted-foreground">{consent.responsible.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(consent.status)}</TableCell>
                    <TableCell>
                      {consent.approvedAt && (
                        <span className="text-sm">
                          {format(new Date(consent.approvedAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      )}
                      {consent.deniedAt && (
                        <span className="text-sm">
                          {format(new Date(consent.deniedAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      )}
                      {consent.status === 'PENDING' && (
                        <span className="text-sm text-muted-foreground">Aguardando</span>
                      )}
                      {consent.status === 'EXPIRED' && (
                        <span className="text-sm text-muted-foreground">Expirado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {consent.notes ? (
                        <span className="text-sm italic">"{consent.notes}"</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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

export function EventConsentsTrackingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
