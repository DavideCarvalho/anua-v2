import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'

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

import { useResponsavelStudentInvoicesQueryOptions } from '../../hooks/queries/use_responsavel_student_invoices'

interface StudentPaymentsContainerProps {
  studentId: string
}

export function StudentPaymentsContainer({ studentId }: StudentPaymentsContainerProps) {
  const { data, isLoading, isError, error } = useQuery(
    useResponsavelStudentInvoicesQueryOptions({ studentId })
  )

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

  const getInvoiceStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status === 'OPEN' && new Date(dueDate) < new Date()

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

  const getPaymentLabel = (payment: any) => {
    if (payment.type === 'EXTRA_CLASS') {
      const extraName = payment.studentHasExtraClass?.extraClass?.name
      return extraName ? `Aula Avulsa - ${extraName}` : 'Aula Avulsa'
    }

    if (payment.type === 'TUITION') return 'Mensalidade'
    if (payment.type === 'STORE') return 'Loja'
    if (payment.type === 'CANTEEN') return 'Cantina'
    if (payment.type === 'COURSE') return 'Curso'
    if (payment.type === 'ENROLLMENT') return 'Matrícula'
    if (payment.type === 'AGREEMENT') return 'Acordo'
    if (payment.type === 'STUDENT_LOAN') return 'Empréstimo'

    return 'Outro'
  }

  return (
    <div className="space-y-6">
      {/* Invoices */}
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
              {data.data.map((invoice: any) => (
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                              {getPaymentLabel(payment)}
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
                  </CardContent>
                </Card>
              ))}
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
