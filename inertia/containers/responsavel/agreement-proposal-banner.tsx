import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Handshake, CheckCircle, XCircle, FileText } from 'lucide-react'

import { api } from '~/lib/api'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function AgreementProposalBanner({ studentId }: { studentId: string }) {
  const queryClient = useQueryClient()

  const proposalsQuery = useQuery(
    api.api.v1.responsavel.api.studentAgreementProposals.queryOptions({
      params: { studentId },
    })
  )

  const acceptMutation = useMutation(
    api.api.v1.responsavel.api.acceptAgreementProposal.mutationOptions()
  )

  const rejectMutation = useMutation(
    api.api.v1.responsavel.api.rejectAgreementProposal.mutationOptions()
  )

  async function handleAccept(id: string) {
    try {
      await acceptMutation.mutateAsync({ params: { id } })
      toast.success('Proposta aceita! A escola será notificada.')
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.responsavel.api.studentAgreementProposals.pathKey(),
      })
    } catch {
      toast.error('Erro ao aceitar proposta')
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectMutation.mutateAsync({ params: { id } })
      toast.success('Proposta recusada.')
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.responsavel.api.studentAgreementProposals.pathKey(),
      })
    } catch {
      toast.error('Erro ao recusar proposta')
    }
  }

  const proposals = proposalsQuery.data ?? []
  const pendingProposals = Array.isArray(proposals)
    ? proposals.filter((p) => p.status === 'SENT_TO_RESPONSIBLE')
    : []

  if (pendingProposals.length === 0) return null

  return (
    <div className="space-y-3">
      {pendingProposals.map((proposal) => (
        <Card key={proposal.id} className="ring-1 ring-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Proposta de Acordo Disponível</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A escola disponibilizou uma proposta de acordo para suas faturas em atraso.
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Valor total: </span>
                <span className="font-semibold">{formatCurrency(proposal.totalAmount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Parcelamento: </span>
                <span className="font-semibold">{proposal.installments}x de {formatCurrency(Math.ceil(proposal.totalAmount / proposal.installments))}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                <FileText className="mr-1 inline h-3 w-3" />
                Faturas incluídas:
              </p>
              <div className="flex flex-wrap gap-1">
                {proposal.invoices.map((pi) => (
                  <Badge key={pi.id} variant="outline" className="text-xs">
                    {pi.invoice.month}/{pi.invoice.year} — {formatCurrency(pi.amount)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => handleAccept(proposal.id)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Aceitar proposta
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(proposal.id)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Recusar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
