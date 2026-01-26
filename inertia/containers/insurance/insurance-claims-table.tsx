import { useState } from 'react'
import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { Check, X, DollarSign, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
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
import { Badge } from '../../components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip'
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
import { Skeleton } from '../../components/ui/skeleton'

import { useInsuranceClaimsQueryOptions } from '../../hooks/queries/use_insurance_claims'
import { useApproveInsuranceClaimMutation } from '../../hooks/mutations/use_approve_insurance_claim'
import { useRejectInsuranceClaimMutation } from '../../hooks/mutations/use_reject_insurance_claim'
import { useMarkClaimPaidMutation } from '../../hooks/mutations/use_mark_claim_paid'
import { brazilianRealFormatter, brazilianDateFormatter } from '../../lib/formatters'

const STATUS_OPTIONS = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Aprovado', value: 'APPROVED' },
  { label: 'Pago', value: 'PAID' },
  { label: 'Rejeitado', value: 'REJECTED' },
]

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  APPROVED: 'border-blue-200 bg-blue-50 text-blue-700',
  PAID: 'border-green-200 bg-green-50 text-green-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  PAID: 'Pago',
  REJECTED: 'Rejeitado',
}

function InsuranceClaimsErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar sinistros</h3>
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

export function InsuranceClaimsTable() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <InsuranceClaimsErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <InsuranceClaimsTableContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function InsuranceClaimsTableContent() {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    status: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  })

  const { status: statusFilter, page, limit } = filters

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const { data, isLoading, error, refetch } = useQuery(
    useInsuranceClaimsQueryOptions({
      status: statusFilter as any,
      page,
      limit,
    })
  )

  const approveMutation = useApproveInsuranceClaimMutation()
  const rejectMutation = useRejectInsuranceClaimMutation()
  const markPaidMutation = useMarkClaimPaidMutation()

  const claims = data?.data || []
  const meta = data?.meta

  const handleApprove = (claimId: string) => {
    toast.promise(approveMutation.mutateAsync({ claimId }), {
      loading: 'Aprovando sinistro...',
      success: 'Sinistro aprovado com sucesso!',
      error: 'Erro ao aprovar sinistro',
    })
  }

  const handleOpenRejectDialog = (claimId: string) => {
    setSelectedClaimId(claimId)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const handleReject = () => {
    if (!selectedClaimId || !rejectionReason.trim()) return

    toast.promise(
      rejectMutation.mutateAsync({
        claimId: selectedClaimId,
        rejectionReason: rejectionReason.trim(),
      }),
      {
        loading: 'Rejeitando sinistro...',
        success: 'Sinistro rejeitado.',
        error: 'Erro ao rejeitar sinistro',
      }
    )

    setRejectDialogOpen(false)
    setSelectedClaimId(null)
    setRejectionReason('')
  }

  const handleMarkPaid = (claimId: string) => {
    toast.promise(markPaidMutation.mutateAsync({ claimId }), {
      loading: 'Marcando como pago...',
      success: 'Sinistro marcado como pago!',
      error: 'Erro ao marcar como pago',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Status</div>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) =>
              setFilters({ status: value === 'all' ? null : value, page: 1 })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sinistros</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum sinistro encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Valor em Atraso</TableHead>
                  <TableHead>Cobertura</TableHead>
                  <TableHead>Valor Coberto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim: any) => (
                  <TableRow key={claim.id}>
                    <TableCell>{brazilianDateFormatter(claim.claimDate)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{claim.studentPayment.student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {claim.studentPayment.student.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {brazilianRealFormatter(claim.overdueAmount / 100)}
                    </TableCell>
                    <TableCell>{claim.coveragePercentage}%</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {brazilianRealFormatter(claim.coveredAmount / 100)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[claim.status] || ''}>
                        {STATUS_LABELS[claim.status] || claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {claim.status === 'PENDING' && (
                          <>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleApprove(claim.id)}
                                    disabled={approveMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Aprovar</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleOpenRejectDialog(claim.id)}
                                    disabled={rejectMutation.isPending}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Rejeitar</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}

                        {claim.status === 'APPROVED' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleMarkPaid(claim.id)}
                                  disabled={markPaidMutation.isPending}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Marcar como Pago</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {meta && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {meta.page} de {meta.lastPage}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setFilters({ page: meta.page - 1 })}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.lastPage}
                  onClick={() => setFilters({ page: meta.page + 1 })}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Sinistro</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. A escola será notificada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Motivo da Rejeição</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Ex: Documentação incompleta, prazo não atingido, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              Rejeitar Sinistro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function InsuranceClaimsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-[180px]" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
