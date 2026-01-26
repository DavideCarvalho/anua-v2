import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'

import { usePendingConsentsQueryOptions, type PendingConsentsResponse } from '../../hooks/queries/use_pending_consents'
import { useRespondConsentMutation } from '../../hooks/mutations/use_respond_consent'

type PendingConsent = PendingConsentsResponse[number]

function PendingConsentsContent() {
  const { data, isLoading, isError, error } = useQuery(usePendingConsentsQueryOptions())
  const respondMutation = useRespondConsentMutation()

  const [selectedConsent, setSelectedConsent] = useState<PendingConsent | null>(null)
  const [respondType, setRespondType] = useState<'approve' | 'deny' | null>(null)
  const [notes, setNotes] = useState('')

  if (isLoading) {
    return <PendingConsentsSkeleton />
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar autorizações</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const consents = data ?? []

  const handleRespond = async () => {
    if (!selectedConsent || !respondType) return

    await respondMutation.mutateAsync({
      id: selectedConsent.id,
      approved: respondType === 'approve',
      notes: notes || undefined,
    })

    setSelectedConsent(null)
    setRespondType(null)
    setNotes('')
  }

  const openDialog = (consent: PendingConsent, type: 'approve' | 'deny') => {
    setSelectedConsent(consent)
    setRespondType(type)
    setNotes('')
  }

  if (consents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma autorização pendente</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Você não possui autorizações aguardando resposta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {consents.map((consent) => (
          <Card key={consent.id} className="border-amber-500/50">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{consent.event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Users className="h-3 w-3" />
                    Aluno: {consent.student.name}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  Pendente
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {consent.event.startDate
                      ? format(new Date(consent.event.startDate), "EEEE, dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })
                      : 'Data não informada'}
                  </span>
                </div>
                {consent.event.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{consent.event.location}</span>
                  </div>
                )}
                {consent.expiresAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Responder até:{' '}
                      {format(new Date(consent.expiresAt), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}
              </div>

              {consent.event.description && (
                <p className="text-sm text-muted-foreground">{consent.event.description}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => openDialog(consent, 'approve')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Autorizar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:bg-destructive/10"
                  onClick={() => openDialog(consent, 'deny')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Negar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedConsent && !!respondType}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedConsent(null)
            setRespondType(null)
            setNotes('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {respondType === 'approve' ? 'Autorizar Participação' : 'Negar Autorização'}
            </DialogTitle>
            <DialogDescription>
              {respondType === 'approve'
                ? `Você está autorizando ${selectedConsent?.student.name} a participar do evento "${selectedConsent?.event.title}".`
                : `Você está negando a participação de ${selectedConsent?.student.name} no evento "${selectedConsent?.event.title}".`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder={
                  respondType === 'approve'
                    ? 'Ex: Autorizo desde que haja supervisão adequada...'
                    : 'Ex: Não autorizo devido a compromissos familiares...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedConsent(null)
                setRespondType(null)
                setNotes('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={respondType === 'approve' ? 'default' : 'destructive'}
              onClick={handleRespond}
              disabled={respondMutation.isPending}
            >
              {respondMutation.isPending
                ? 'Processando...'
                : respondType === 'approve'
                  ? 'Confirmar Autorização'
                  : 'Confirmar Negação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function PendingConsentsContainer() {
  return (
    <ErrorBoundary
      fallback={
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Erro ao carregar autorizações</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ocorreu um erro ao renderizar o componente.
            </p>
          </CardContent>
        </Card>
      }
    >
      <PendingConsentsContent />
    </ErrorBoundary>
  )
}

export function PendingConsentsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
              <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
