import { useState } from 'react'
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
import { Button } from '../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'
import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'

type StoreItemsResponse = Awaited<Route.Response<'api.v1.store_items.index'>>
import { CreateProductModal } from './create-product-modal'
import { EditProductModal } from './edit-product-modal'

const categoryLabels: Record<string, string> = {
  SCHOOL_SUPPLY: 'Material Escolar',
  PRIVILEGE: 'Privilégio',
  HOMEWORK_PASS: 'Passe de Tarefa',
  UNIFORM: 'Uniforme',
  BOOK: 'Livro',
  MERCHANDISE: 'Mercadoria',
  DIGITAL: 'Digital',
  OTHER: 'Outro',
}

interface StoreProductsTabProps {
  storeId: string
}

export function StoreProductsTab({ storeId }: StoreProductsTabProps) {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<StoreItemsResponse['data'][number] | null>(
    null
  )
  const [stockProduct, setStockProduct] = useState<StoreItemsResponse['data'][number] | null>(null)
  const [stockOperation, setStockOperation] = useState<'ADD' | 'REMOVE'>('ADD')
  const [stockAmount, setStockAmount] = useState('1')

  const { data: items, isLoading } = useQuery(
    api.api.v1.storeItems.index.queryOptions({ query: { storeId } })
  )

  const deleteMutation = useMutation(api.api.v1.storeItems.destroy.mutationOptions())
  const updateMutation = useMutation(api.api.v1.storeItems.update.mutationOptions())

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync({ params: { id } })
      queryClient.invalidateQueries({ queryKey: api.api.v1.storeItems.index.pathKey() })
      toast.success('Produto excluído com sucesso!')
    } catch {
      toast.error('Erro ao excluir produto.')
    }
  }

  async function handleAdjustStock() {
    if (!stockProduct) return

    const amount = Number(stockAmount)
    if (!Number.isInteger(amount) || amount <= 0) {
      toast.error('Informe uma quantidade válida')
      return
    }

    if (stockProduct.totalStock === null) {
      toast.error('Produto com estoque ilimitado. Edite o produto para definir estoque finito.')
      return
    }

    const nextStock =
      stockOperation === 'ADD'
        ? stockProduct.totalStock + amount
        : Math.max(0, stockProduct.totalStock - amount)

    try {
      await updateMutation.mutateAsync({
        params: { id: stockProduct.id },
        body: {
          totalStock: nextStock,
        },
      })

      await queryClient.invalidateQueries({ queryKey: api.api.v1.storeItems.index.pathKey() })
      toast.success('Estoque atualizado com sucesso!')
      setStockProduct(null)
      setStockAmount('1')
      setStockOperation('ADD')
    } catch {
      toast.error('Erro ao atualizar estoque.')
    }
  }

  const itemsList = items?.data ?? []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos</CardTitle>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !itemsList.length ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum produto cadastrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsList.map((item) => (
                  <TableRow key={item.id} className={!item.isActive ? 'opacity-50' : undefined}>
                    <TableCell className="font-medium">
                      {item.name}
                      {!item.isActive && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[item.category] ?? item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>{item.totalStock ?? '∞'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingProduct(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {item.totalStock !== null ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setStockProduct(item)
                                setStockOperation('ADD')
                                setStockAmount('1')
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Alterar estoque
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateProductModal
        storeId={storeId}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) setEditingProduct(null)
          }}
        />
      )}

      <Dialog
        open={!!stockProduct}
        onOpenChange={(open) => {
          if (!open) {
            setStockProduct(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar estoque</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Produto: <span className="font-medium text-foreground">{stockProduct?.name}</span>
            </div>

            <div className="space-y-2">
              <Label>Operação</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={stockOperation === 'ADD' ? 'default' : 'outline'}
                  onClick={() => setStockOperation('ADD')}
                >
                  Adicionar
                </Button>
                <Button
                  type="button"
                  variant={stockOperation === 'REMOVE' ? 'default' : 'outline'}
                  onClick={() => setStockOperation('REMOVE')}
                >
                  Remover
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-amount">Quantidade</Label>
              <Input
                id="stock-amount"
                type="number"
                min="1"
                step="1"
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Estoque atual:{' '}
              <span className="font-medium text-foreground">
                {stockProduct?.totalStock === null ? '∞ (ilimitado)' : stockProduct?.totalStock}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStockProduct(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAdjustStock} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
