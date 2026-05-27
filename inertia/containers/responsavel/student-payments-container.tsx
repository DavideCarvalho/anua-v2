import { useState } from 'react'
import { CheckCircle, Clock, AlertTriangle, XCircle, ExternalLink, Loader2, Info, Copy, QrCode } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

function getPaymentDescription(payment: any): string {
  const contractName = payment.contract?.name
  const installmentInfo =
    payment.installments > 0 ? ` (${payment.installmentNumber}/${payment.installments})` : ''

  switch (payment.type) {
    case 'TUITION':
      return 'Mensalidade'
    case 'ENROLLMENT':
      return contractName
        ? `Matrícula - ${contractName}${installmentInfo}`
        : `Matrícula${installmentInfo}`
    case 'EXTRA_CLASS':
      return payment.studentHasExtraClass?.extraClass?.name
        ? `Aula Avulsa - ${payment.studentHasExtraClass.extraClass.name}`
        : 'Aula Avulsa'
    case 'COURSE':
      return contractName ? `Curso - ${contractName}` : 'Curso'
    case 'STORE':
      return 'Loja'
    case 'CANTEEN':
      return 'Cantina'
    case 'AGREEMENT':
      return 'Acordo'
    case 'STUDENT_LOAN':
      return 'Empréstimo'
    default:
      return 'Outro'
  }
}

const PIX_KEY_TYPE_LABELS: Record<string, string> = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  EMAIL: 'E-mail',
  PHONE: 'Telefone',
  RANDOM: 'Chave aleatória',
}

function OfflinePaymentFallback({
  schoolPaymentInfo,
}: {
  schoolPaymentInfo: { name: string; pixKey: string | null; pixKeyType: string | null } | null
}) {
  const hasPixKey = schoolPaymentInfo?.pixKey

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">
          <Info className="h-3 w-3" />
          Como pagar
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-3 text-sm" align="end">
        {hasPixKey ? (
          <>
            <p className="font-medium">Pague via PIX</p>
            <div className="space-y-1.5">
              <p className="text-muted-foreground">
                {PIX_KEY_TYPE_LABELS[schoolPaymentInfo.pixKeyType ?? ''] ?? 'Chave PIX'}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                  {schoolPaymentInfo.pixKey}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(schoolPaymentInfo.pixKey ?? '')}
                  className="rounded p-1 hover:bg-muted transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              {schoolPaymentInfo.name && (
                <p className="text-xs text-muted-foreground">
                  Favorecido: {schoolPaymentInfo.name}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="font-medium">Pagamento não disponível online</p>
            <p className="text-muted-foreground">
              Entre em contato com a secretaria da escola para obter os dados de pagamento.
            </p>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

interface StudentPaymentsContainerProps {
  studentId: string
}

interface PixModalData {
  qrCodeImage: string
  copyPaste: string
  expirationDate: string
  invoiceUrl: string | null
}

function PixQrModal({ data, onClose }: { data: PixModalData | null; onClose: () => void }) {
  const handleCopy = () => {
    if (!data) return
    navigator.clipboard.writeText(data.copyPaste)
  }

  return (
    <Dialog open={!!data} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="z-[110] max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagar via PIX
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR code com o app do seu banco ou copie o código.
          </DialogDescription>
        </DialogHeader>
        {data && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${data.qrCodeImage}`}
                alt="QR Code PIX"
                className="h-56 w-56 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Código PIX copia e cola</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1.5 text-xs">
                  {data.copyPaste.substring(0, 40)}...
                </code>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="mr-1.5 h-3 w-3" />
                  Copiar
                </Button>
              </div>
            </div>

            {data.invoiceUrl && (
              <a
                href={data.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Prefere boleto? Abrir página de pagamento
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function StudentPaymentsContainer({ studentId }: StudentPaymentsContainerProps) {
  const queryClient = useQueryClient()
  const [pixModal, setPixModal] = useState<PixModalData | null>(null)
  const { data, isLoading, isError, error } = useQuery(
    api.api.v1.responsavel.api.studentInvoices.queryOptions({ params: { studentId } })
  )
  const checkoutMutation = useMutation(api.api.v1.responsavel.api.invoiceCheckout.mutationOptions())

  if (isLoading) {
    return <StudentPaymentsContainerSkeleton />
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar pagamentos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return <StudentPaymentsContainerSkeleton />
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  const isInvoiceOverdue = (status: string, dueDate: string) => {
    return (status === 'OPEN' || status === 'PENDING') && new Date(dueDate) < new Date()
  }

  const isInvoiceFinalized = (status: string) => status === 'PAID' || status === 'CANCELLED'

  const canOpenExistingInvoiceUrl = (invoice: any, isOverdue: boolean) => {
    if (!invoice.invoiceUrl) return false
    return invoice.status === 'PENDING' || invoice.status === 'OVERDUE' || isOverdue
  }

  const canCreateCheckout = (invoice: any, isOverdue: boolean) => {
    if (!data.asaasEnabled) return false
    return invoice.status === 'OPEN' || invoice.status === 'OVERDUE' || isOverdue
  }

  const handleCreateCheckout = (invoiceId: string) => {
    checkoutMutation.mutate(
      { params: { id: invoiceId } },
      {
        onSuccess: (raw) => {
          queryClient.invalidateQueries({ queryKey: ['responsavel', 'student-invoices'] })

          // PIX fields are returned by the controller but Tuyau schema
          // only updates after server restart — use runtime check
          const r: Record<string, unknown> = raw
          const pixImage = typeof r.pixQrCodeImage === 'string' ? r.pixQrCodeImage : null
          const pixPaste = typeof r.pixCopyPaste === 'string' ? r.pixCopyPaste : null

          if (pixImage && pixPaste) {
            setPixModal({
              qrCodeImage: pixImage,
              copyPaste: pixPaste,
              expirationDate: typeof r.pixExpirationDate === 'string' ? r.pixExpirationDate : '',
              invoiceUrl: raw.invoiceUrl ?? null,
            })
            return
          }

          if (raw.invoiceUrl) {
            window.open(raw.invoiceUrl, '_blank')
          }
        },
      }
    )
  }

  const renderPayInvoiceAction = (invoice: any) => {
    const isOverdue = isInvoiceOverdue(invoice.status, String(invoice.dueDate))
    if (isInvoiceFinalized(invoice.status)) return null

    if (canOpenExistingInvoiceUrl(invoice, isOverdue)) {
      return (
        <a
          href={invoice.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Pagar fatura
        </a>
      )
    }

    if (canCreateCheckout(invoice, isOverdue)) {
      return (
        <button
          onClick={() => handleCreateCheckout(invoice.id)}
          disabled={checkoutMutation.isPending}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {checkoutMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ExternalLink className="h-3 w-3" />
          )}
          Pagar fatura
        </button>
      )
    }

    const isPendingPayment =
      invoice.status === 'OPEN' || invoice.status === 'PENDING' || invoice.status === 'OVERDUE' || isOverdue
    if (!isPendingPayment) return null

    return <OfflinePaymentFallback schoolPaymentInfo={data.schoolPaymentInfo} />
  }

  const getInvoiceStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = isInvoiceOverdue(status, dueDate)

    if (status === 'PAID') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          Pago
        </Badge>
      )
    }

    if (status === 'OVERDUE' || isOverdue) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Atrasado
        </Badge>
      )
    }

    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Aberta
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'PAID') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          Pago
        </Badge>
      )
    }

    if (status === 'OVERDUE') {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Atrasado
        </Badge>
      )
    }

    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        Pendente
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <PixQrModal data={pixModal} onClose={() => setPixModal(null)} />

      <Card>
        <CardHeader>
          <CardTitle>Faturas</CardTitle>
          <CardDescription>Mensalidades e parcelas</CardDescription>
        </CardHeader>
        <CardContent>
          {data.data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Nenhuma fatura encontrada</div>
          ) : (
            <div className="space-y-4">
              {data.data.map((invoice: any) => {
                return (
                  <Card key={invoice.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {format(new Date(invoice.dueDate), "MMMM 'de' yyyy", { locale: ptBR })}
                          </CardTitle>
                          <CardDescription>
                            Vencimento {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">
                            {formatCurrency(invoice.totalAmount)}
                          </span>
                          {getInvoiceStatusBadge(invoice.status, String(invoice.dueDate))}
                          {renderPayInvoiceAction(invoice)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Desktop: tabela */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Referência</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(invoice.payments ?? []).map((payment: any) => (
                              <TableRow key={payment.id}>
                                <TableCell className="font-medium">
                                  {getPaymentDescription(payment)}
                                </TableCell>
                                <TableCell>
                                  {format(new Date(payment.dueDate), "MMMM 'de' yyyy", {
                                    locale: ptBR,
                                  })}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(payment.amount)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getPaymentStatusBadge(payment.status)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile: cards empilhados */}
                      <div className="space-y-2 md:hidden">
                        {(invoice.payments ?? []).map((payment: any) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {getPaymentDescription(payment)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(payment.dueDate), "MMM yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-medium tabular-nums">
                                {formatCurrency(payment.amount)}
                              </span>
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function StudentPaymentsContainerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-64 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
