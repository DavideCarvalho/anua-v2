import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from '../../../hooks/use_search_params'
import { api } from '~/lib/api'
import { ChartContainer } from '../shared/chart-container'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'

export function TopSellingItemsTable() {
  const { params } = useSearchParams()
  const { data, isLoading, error } = useQuery(
    api.api.v1.analytics.canteen.topItems.queryOptions({
      query: {
        schoolId: params.schoolId,
        schoolChainId: params.schoolChainId,
      },
    })
  )

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <ChartContainer
      title="Itens Mais Vendidos"
      description="Top 10 produtos por quantidade vendida"
      isLoading={isLoading}
      error={error instanceof Error ? error : undefined}
    >
      {data && data.items && data.items.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Qtd. Vendida</TableHead>
              <TableHead className="text-right">Receita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item: any, index: number) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {index < 3 && (
                    <span className="mr-2">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  )}
                  {item.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category || 'Geral'}</Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right">{item.quantitySold}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.totalRevenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Nenhum item vendido encontrado
        </div>
      )}
    </ChartContainer>
  )
}
