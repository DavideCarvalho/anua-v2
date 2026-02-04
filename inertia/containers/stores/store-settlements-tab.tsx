import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '../../lib/utils'

interface StoreSettlementsTabProps {
  storeId: string
}

async function fetchSettlements(storeId: string) {
  const response = await fetch(`/api/v1/store-settlements?storeId=${storeId}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch settlements')
  return response.json()
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  PROCESSING: 'Processando',
  TRANSFERRED: 'Transferido',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
}

export function StoreSettlementsTab({ storeId }: StoreSettlementsTabProps) {
  const { data: settlements, isLoading } = useQuery({
    queryKey: ['storeSettlements', storeId],
    queryFn: () => fetchSettlements(storeId),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repasses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !settlements?.data?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum repasse encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periodo</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Comissao</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Repasse</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.data.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{String(s.month).padStart(2, '0')}/{s.year}</TableCell>
                  <TableCell>{formatCurrency(s.totalSalesAmount)}</TableCell>
                  <TableCell>{formatCurrency(s.commissionAmount)}</TableCell>
                  <TableCell>{formatCurrency(s.platformFeeAmount)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(s.transferAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {statusLabels[s.status] ?? s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
