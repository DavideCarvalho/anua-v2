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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'
import { useStoreItemsQueryOptions, type StoreItemResponse } from '../../hooks/queries/use_stores'
import { useDeleteStoreItemMutationOptions } from '../../hooks/mutations/use_delete_store_item'
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
  const [editingProduct, setEditingProduct] = useState<StoreItemResponse | null>(null)

  const { data: items, isLoading } = useQuery(useStoreItemsQueryOptions({ storeId }))

  const deleteMutation = useMutation(useDeleteStoreItemMutationOptions())

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id)
      queryClient.invalidateQueries({ queryKey: ['storeItems'] })
      toast.success('Produto excluído com sucesso!')
    } catch {
      toast.error('Erro ao excluir produto.')
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
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto cadastrado
            </div>
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
          storeId={storeId}
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) setEditingProduct(null)
          }}
        />
      )}
    </>
  )
}
