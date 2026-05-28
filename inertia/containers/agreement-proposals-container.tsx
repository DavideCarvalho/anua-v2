import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, AlertTriangle, User, FileText } from 'lucide-react'
import { useState } from 'react'

import { api } from '~/lib/api'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'

type ProposalStatus =
  | 'PENDING_SCHOOL_APPROVAL'
  | 'APPROVED'
  | 'SENT_TO_RESPONSIBLE'
  | 'ACCEPTED'
  | 'REJECTED_BY_SCHOOL'
  | 'REJECTED_BY_RESPONSIBLE'
  | 'CANCELLED'
  | 'EXPIRED'

const STATUS_CONFIG: Record<ProposalStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  PENDING_SCHOOL_APPROVAL: { label: 'Aguardando aprovação', variant: 'outline' },
  APPROVED: { label: 'Aprovada', variant: 'default' },
  SENT_TO_RESPONSIBLE: { label: 'Enviada ao responsável', variant: 'default' },
  ACCEPTED: { label: 'Aceita', variant: 'default' },
  REJECTED_BY_SCHOOL: { label: 'Rejeitada', variant: 'destructive' },
  REJECTED_BY_RESPONSIBLE: { label: 'Recusada pelo resp.', variant: 'destructive' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' },
  EXPIRED: { label: 'Expirada', variant: 'secondary' },
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDaysOverdue(days: number): string {
  if (days < 30) return `${days} dias`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 mês' : `${months} meses`
}

export function AgreementProposalsContainer() {
  const queryClient = useQueryClient()
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const proposalsQuery = useQuery(
    api.api.v1.agreementProposals.index.queryOptions({})
  )

  const approveMutation = useMutation(
    api.api.v1.agreementProposals.approve.mutationOptions()
  )

  const rejectMutation = useMutation(
    api.api.v1.agreementProposals.reject.mutationOptions()
  )

  async function handleApprove(id: string) {
    try {
      await approveMutation.mutateAsync({ params: { id } })
      toast.success('Proposta aprovada e enviada ao responsável')
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.agreementProposals.index.pathKey(),
      })
    } catch {
      toast.error('Erro ao aprovar proposta')
    }
  }

  function handleOpenRejectDialog(id: string) {
    setRejectDialogId(id)
    setRejectReason('')
  }

  async function handleConfirmReject() {
    if (!rejectDialogId) return
    try {
      await rejectMutation.mutateAsync({ params: { id: rejectDialogId }, body: { reason: rejectReason } })
      toast.success('Proposta rejeitada')
      setRejectDialogId(null)
      setRejectReason('')
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.agreementProposals.index.pathKey(),
      })
    } catch {
      toast.error('Erro ao rejeitar proposta')
    }
  }

  const proposals = proposalsQuery.data?.data ?? []

  if (proposalsQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma proposta de acordo pendente
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Propostas são geradas automaticamente para faturas com mais de 15 dias em atraso
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {proposals.map((proposal) => {
          const statusConfig = STATUS_CONFIG[proposal.status]
          const isPending = proposal.status === 'PENDING_SCHOOL_APPROVAL'

          return (
            <Card key={proposal.id} className="ring-1 ring-foreground/10">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{proposal.student?.user?.name ?? 'Aluno'}</CardTitle>
                  </div>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-medium">{formatCurrency(proposal.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Parcelas: </span>
                    <span className="font-medium">{proposal.installments}x</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Maior atraso: </span>
                    <span className="font-medium text-destructive">
                      {formatDaysOverdue(proposal.overdueDays)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    <FileText className="mr-1 inline h-3 w-3" />
                    {proposal.invoices?.length ?? 0} fatura(s) incluída(s)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proposal.invoices?.map((pi) => (
                      <Badge key={pi.id} variant="outline" className="text-xs">
                        {pi.invoice?.month}/{pi.invoice?.year} — {formatCurrency(pi.amount)} ({pi.overdueDays}d)
                      </Badge>
                    ))}
                  </div>
                </div>

                {proposal.approvedBy && (
                  <p className="text-xs text-muted-foreground">
                    Aprovada por {proposal.approvedBy.name}
                  </p>
                )}

                {proposal.rejectedBy && (
                  <p className="text-xs text-destructive">
                    Rejeitada por {proposal.rejectedBy.name}
                    {proposal.rejectionReason ? `: ${proposal.rejectionReason}` : ''}
                  </p>
                )}

                {proposal.cancellationReason && (
                  <p className="text-xs text-muted-foreground">
                    <AlertTriangle className="mr-1 inline h-3 w-3" />
                    {proposal.cancellationReason}
                  </p>
                )}

                {isPending && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(proposal.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Aprovar e enviar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenRejectDialog(proposal.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Rejeitar
                    </Button>
                  </div>
                )}

                {proposal.status === 'SENT_TO_RESPONSIBLE' && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Aguardando resposta do responsável
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog
        open={rejectDialogId !== null}
        onOpenChange={(open) => { if (!open) setRejectDialogId(null) }}
      >
        <DialogContent className="z-[110]">
          <DialogHeader>
            <DialogTitle>Rejeitar proposta</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição (opcional). Essa informação fica registrada na auditoria.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeição..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={rejectMutation.isPending}
            >
              Confirmar rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
