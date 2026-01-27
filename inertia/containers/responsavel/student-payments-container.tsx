import { useQuery } from '@tanstack/react-query'
import { DollarSign, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

import {
  useResponsavelStudentPaymentsQueryOptions,
  type ResponsavelStudentPaymentsResponse,
} from '../../hooks/queries/use_responsavel_student_payments'

type Payment = ResponsavelStudentPaymentsResponse['data'][number]

interface StudentPaymentsContainerProps {
  studentId: string
  studentName: string
}

export function StudentPaymentsContainer({
  studentId,
  studentName,
}: StudentPaymentsContainerProps) {
  const { data, isLoading, isError, error } = useQuery(
    useResponsavelStudentPaymentsQueryOptions({ studentId })
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
    }).format(value)
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status === 'PENDING' && new Date(dueDate) < new Date()

    if (status === 'PAID') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          Pago
        </Badge>
      )
    }

    if (isOverdue) {
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
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Financeiro - {studentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{formatCurrency(data.summary.totalAmount)}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(data.summary.paidAmount)}
              </p>
              <p className="text-sm text-muted-foreground">Pago</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(data.summary.pendingAmount)}
              </p>
              <p className="text-sm text-muted-foreground">Pendente</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(data.summary.overdueAmount)}
              </p>
              <p className="text-sm text-muted-foreground">Em Atraso</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      {data.summary.overdueCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="font-medium text-red-800">
                Voce possui {data.summary.overdueCount} parcela(s) em atraso totalizando{' '}
                {formatCurrency(data.summary.overdueAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Pagamentos</CardTitle>
          <CardDescription>Mensalidades e parcelas</CardDescription>
        </CardHeader>
        <CardContent>
          {data.data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum pagamento encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((payment: Payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.description}</TableCell>
                    <TableCell>
                      {format(new Date(payment.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(payment.status, payment.dueDate)}
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
