import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Plus, Gift, Package, Coffee, Star, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { api } from '~/lib/api'

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
import { Switch } from '../../components/ui/switch'

interface StoreItemsTableProps {
  schoolId: string
  onCreateItem?: () => void
}

const categoryLabels: Record<string, string> = {
  CANTEEN_FOOD: 'Comida',
  CANTEEN_DRINK: 'Bebida',
  SCHOOL_SUPPLY: 'Material',
  PRIVILEGE: 'Privilégio',
  HOMEWORK_PASS: 'Passe Lição',
  UNIFORM: 'Uniforme',
  BOOK: 'Livro',
  MERCHANDISE: 'Mercadoria',
  DIGITAL: 'Digital',
  OTHER: 'Outro',
}

const categoryIcons: Record<string, React.ReactNode> = {
  CANTEEN_FOOD: <Coffee className="h-4 w-4" />,
  CANTEEN_DRINK: <Coffee className="h-4 w-4" />,
  PRIVILEGE: <Star className="h-4 w-4" />,
  HOMEWORK_PASS: <Sparkles className="h-4 w-4" />,
  DEFAULT: <Package className="h-4 w-4" />,
}

const paymentModeLabels: Record<string, string> = {
  POINTS_ONLY: 'Só Pontos',
  MONEY_ONLY: 'Só Dinheiro',
  HYBRID: 'Híbrido',
}

export function StoreItemsTable({ schoolId, onCreateItem }: StoreItemsTableProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery(
    api.api.v1.storeItems.index.queryOptions({ query: { schoolId } })
  )
  const toggleMutation = useMutation(api.api.v1.storeItems.toggleActive.mutationOptions())
  const deleteMutation = useMutation(api.api.v1.storeItems.destroy.mutationOptions())

  console.log(error)

  const items = data?.data ?? []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2">Carregando itens...</p>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum item cadastrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre itens para que os alunos possam trocar seus pontos
          </p>
          {onCreateItem && (
            <Button className="mt-4" onClick={onCreateItem}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Itens da Loja</CardTitle>
          <CardDescription>{items.length} item(ns) cadastrado(s)</CardDescription>
        </div>
        {onCreateItem && (
          <Button onClick={onCreateItem}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Modo</TableHead>
              <TableHead className="text-center">Estoque</TableHead>
              <TableHead className="text-center">Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {categoryIcons[item.category] || categoryIcons.DEFAULT}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{categoryLabels[item.category] || item.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{formatCurrency(item.price)}</span>
                    {item.paymentMode === 'POINTS_ONLY' && (
                      <span className="text-xs text-muted-foreground">
                        = {Math.round(item.price * (item.pointsToMoneyRate || 100))} pts
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.paymentMode === 'POINTS_ONLY'
                        ? 'default'
                        : item.paymentMode === 'HYBRID'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {paymentModeLabels[item.paymentMode] || item.paymentMode}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {item.totalStock !== null ? item.totalStock : '∞'}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={async () => {
                      try {
                        await toggleMutation.mutateAsync({ params: { id: item.id } })
                        queryClient.invalidateQueries({ queryKey: ['store-items'] })
                      } catch {
                        toast.error('Erro ao alterar status do item.')
                      }
                    }}
                    disabled={toggleMutation.isPending}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver Pedidos</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={async () => {
                          try {
                            await deleteMutation.mutateAsync({ params: { id: item.id } })
                            queryClient.invalidateQueries({ queryKey: ['store-items'] })
                            toast.success('Item excluído com sucesso!')
                          } catch {
                            toast.error('Erro ao excluir item.')
                          }
                        }}
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
