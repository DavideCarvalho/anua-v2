import { useSuspenseQuery } from '@tanstack/react-query'
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '../../lib/utils'
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

import { useStudentBalanceQueryOptions } from '../../hooks/queries/use-student-balance'

interface StudentBalanceContainerProps {
  studentId: string
  studentName: string
}

export function StudentBalanceContainer({
  studentId,
  studentName,
}: StudentBalanceContainerProps) {
  const { data } = useSuspenseQuery(useStudentBalanceQueryOptions({ studentId }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600'
    if (balance < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Saldo da Cantina - {studentName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-6 bg-muted rounded-lg">
              <p className={cn('text-4xl font-bold', getBalanceColor(data.summary.currentBalance))}>
                {formatCurrency(data.summary.currentBalance)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Saldo Atual</p>
            </div>
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.summary.totalCredits)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total de Creditos</p>
            </div>
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="h-6 w-6 text-red-600" />
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.summary.totalDebits)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total de Gastos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Balance Warning */}
      {data.summary.currentBalance < 10 && data.summary.currentBalance >= 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-yellow-600" />
              <p className="font-medium text-yellow-800">
                Saldo baixo! Considere adicionar mais creditos para evitar problemas na cantina.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Transacoes</CardTitle>
          <CardDescription>Creditos e gastos na cantina</CardDescription>
        </CardHeader>
        <CardContent>
          {data.data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma transacao encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.type === 'CREDIT' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          Credito
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                          Debito
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={transaction.status === 'COMPLETED' ? 'default' : 'secondary'}
                      >
                        {transaction.status === 'COMPLETED' ? 'Concluido' : 'Pendente'}
                      </Badge>
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

export function StudentBalanceContainerSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-64 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
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
