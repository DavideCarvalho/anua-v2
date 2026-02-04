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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'
import { EditProductModal } from './edit-product-modal'

const categoryLabels: Record<string, string> = {
  CANTEEN_FOOD: 'Cantina - Comida',
  CANTEEN_DRINK: 'Cantina - Bebida',
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

async function fetchStoreItems(storeId: string) {
  const response = await fetch(`/api/v1/store-items?storeId=${storeId}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch items')
  return response.json()
}

async function deleteStoreItem(id: string) {
  const response = await fetch(`/api/v1/store-items/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to delete item')
  return response.json()
}

export function StoreProductsTab({ storeId }: StoreProductsTabProps) {
  const queryClient = useQueryClient()
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const { data: items, isLoading } = useQuery({
    queryKey: ['storeItems', storeId],
    queryFn: () => fetchStoreItems(storeId),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStoreItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeItems', storeId] })
      toast.success('Produto excluído com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir produto.')
    },
  })

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !items?.data?.length ? (
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
                {items.data.map((item: any) => (
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
                            onClick={() => deleteMutation.mutate(item.id)}
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
