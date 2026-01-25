import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { useCanteenReport } from '../../hooks/queries/use_canteen_reports'
import type { SharedProps } from '../../lib/types'

const paymentMethodIcons: Record<string, typeof CreditCard> = {
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  PIX: QrCode,
  CASH: Banknote,
  BALANCE: DollarSign,
}

const paymentMethodLabels: Record<string, string> = {
  CREDIT_CARD: 'Cartao de Credito',
  DEBIT_CARD: 'Cartao de Debito',
  PIX: 'PIX',
  CASH: 'Dinheiro',
  BALANCE: 'Saldo',
}

interface CanteenReportsDashboardProps {
  canteenId: string
}

export function CanteenReportsDashboard({ canteenId }: CanteenReportsDashboardProps) {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: report } = useCanteenReport({
    canteenId,
    startDate,
    endDate,
    topItemsLimit: 5,
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Label htmlFor="startDate" className="sr-only">
                Data inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[160px]"
              />
              <span className="text-muted-foreground">ate</span>
              <Label htmlFor="endDate" className="sr-only">
                Data final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report?.totals.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              No periodo selecionado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.totals.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos finalizados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Medio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report?.totals.averageTicket || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Por pedido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Formas de Pagamento
            </CardTitle>
            <CardDescription>Distribuicao por metodo de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            {report?.paymentsByMethod && report.paymentsByMethod.length > 0 ? (
              <div className="space-y-4">
                {report.paymentsByMethod.map((method) => {
                  const Icon = paymentMethodIcons[method.paymentMethod] || DollarSign
                  const label = paymentMethodLabels[method.paymentMethod] || method.paymentMethod
                  const percentage = report.totals.totalRevenue > 0
                    ? ((method.totalRevenue / report.totals.totalRevenue) * 100).toFixed(1)
                    : 0

                  return (
                    <div key={method.paymentMethod} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.totalOrders} pedidos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(method.totalRevenue)}</p>
                        <p className="text-sm text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum dado disponivel
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos Mais Vendidos
            </CardTitle>
            <CardDescription>Top 5 itens por quantidade</CardDescription>
          </CardHeader>
          <CardContent>
            {report?.topItems && report.topItems.length > 0 ? (
              <div className="space-y-4">
                {report.topItems.map((item, index) => (
                  <div key={item.itemId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.totalQuantity} unidades
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(item.totalRevenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum dado disponivel
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reservation Summary */}
      {report?.reservationsByStatus && report.reservationsByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reservas de Refeicoes</CardTitle>
            <CardDescription>Status das reservas no periodo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {report.reservationsByStatus.map((reservation) => (
                <div key={reservation.status} className="flex items-center gap-2">
                  <Badge
                    variant={
                      reservation.status === 'CONFIRMED'
                        ? 'default'
                        : reservation.status === 'CANCELLED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {reservation.status}
                  </Badge>
                  <span className="font-medium">{reservation.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
