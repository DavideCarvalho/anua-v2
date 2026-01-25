import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Clock, Calendar, History } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'

import { useConsentHistoryQueryOptions } from '../../hooks/queries/use_consent_history'

type ConsentHistoryItem = {
  id: string
  eventId: string
  studentId: string
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED'
  notes: string | null
  requestedAt: string
  approvedAt: string | null
  deniedAt: string | null
  expiresAt: string | null
  event: {
    id: string
    title: string
    type: string
    startsAt: string
    school: {
      id: string
      name: string
    }
  }
  student: {
    id: string
    name: string
  }
}

interface ConsentHistoryContainerProps {
  page?: number
  onPageChange?: (page: number) => void
}

export function ConsentHistoryContainer({
  page = 1,
  onPageChange,
}: ConsentHistoryContainerProps) {
  const { data } = useSuspenseQuery(useConsentHistoryQueryOptions({ page, limit: 10 }))

  const consents = data.data as ConsentHistoryItem[]
  const meta = data.meta

  const getStatusBadge = (status: ConsentHistoryItem['status']) => {
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
            <Clock className="h-3 w-3 mr-1" />
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

  if (consents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <History className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum histórico</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Você ainda não possui histórico de autorizações.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {consents.map((consent) => (
        <Card key={consent.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{consent.event.title}</CardTitle>
                <CardDescription className="mt-1">
                  Aluno: {consent.student.name} • {consent.event.school.name}
                </CardDescription>
              </div>
              {getStatusBadge(consent.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Evento:{' '}
                  {format(new Date(consent.event.startsAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              {consent.approvedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>
                    Autorizado em:{' '}
                    {format(new Date(consent.approvedAt), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}
              {consent.deniedAt && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span>
                    Negado em:{' '}
                    {format(new Date(consent.deniedAt), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}
              {consent.notes && (
                <p className="mt-2 text-sm italic">"{consent.notes}"</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {meta.lastPage > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Página {page} de {meta.lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.lastPage}
            onClick={() => onPageChange?.(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}

export function ConsentHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
              </div>
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-56 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
