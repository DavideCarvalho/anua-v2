import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Printer,
  Check,
  X,
  Clock,
  FileText,
  RotateCcw,
  Download,
  MoreHorizontal,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { usePrintRequestsQueryOptions } from '../../hooks/queries/use_print_requests'
import {
  useApprovePrintRequest,
  useRejectPrintRequest,
  useMarkPrintRequestPrinted,
  useReviewPrintRequest,
} from '../../hooks/mutations/use_print_request_actions'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'

interface PrintRequestsTableProps {
  statuses?: string[]
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
> = {
  REQUESTED: { label: 'Solicitado', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  APPROVED: { label: 'Aprovado', variant: 'default', icon: <Check className="h-3 w-3" /> },
  REJECTED: { label: 'Rejeitado', variant: 'destructive', icon: <X className="h-3 w-3" /> },
  PRINTED: { label: 'Impresso', variant: 'outline', icon: <Printer className="h-3 w-3" /> },
  REVIEW: { label: 'Em Revisão', variant: 'secondary', icon: <RotateCcw className="h-3 w-3" /> },
}

export function PrintRequestsTable({ statuses }: PrintRequestsTableProps) {
  const { data } = useSuspenseQuery(usePrintRequestsQueryOptions({ statuses } as any))
  const approveMutation = useApprovePrintRequest()
  const rejectMutation = useRejectPrintRequest()
  const printedMutation = useMarkPrintRequestPrinted()
  const reviewMutation = useReviewPrintRequest()

  const requests = (data as any)?.data ?? []

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Printer className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma solicitação encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            As solicitações de impressão aparecerão aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Impressão</CardTitle>
        <CardDescription>{requests.length} solicitação(ões)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead className="text-center">Frente/Verso</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request: any) => {
              const config = statusConfig[request.status] || statusConfig.REQUESTED

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {request.path}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{request.user?.name || '-'}</TableCell>
                  <TableCell className="text-center font-medium">{request.quantity}</TableCell>
                  <TableCell className="text-center">
                    {request.frontAndBack ? (
                      <Badge variant="outline">Sim</Badge>
                    ) : (
                      <span className="text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {request.dueDate
                      ? format(new Date(request.dueDate), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="gap-1">
                      {config.icon}
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {request.status === 'REQUESTED' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => approveMutation.mutate(request.id)}
                            disabled={approveMutation.isPending}
                            title="Aprovar"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rejectMutation.mutate({ id: request.id })}
                            disabled={rejectMutation.isPending}
                            title="Rejeitar"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reviewMutation.mutate(request.id)}
                            disabled={reviewMutation.isPending}
                            title="Solicitar Revisão"
                          >
                            <RotateCcw className="h-4 w-4 text-yellow-600" />
                          </Button>
                        </>
                      )}
                      {request.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printedMutation.mutate(request.id)}
                          disabled={printedMutation.isPending}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Marcar Impresso
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Arquivo
                          </DropdownMenuItem>
                          {request.rejectedFeedback && (
                            <DropdownMenuItem disabled>
                              Feedback: {request.rejectedFeedback}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
