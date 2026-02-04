import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { useOwnProductsQueryOptions } from '../hooks/queries/use_store_owner'
import { useToggleProductActive, useDeleteProduct } from '../hooks/mutations/use_store_owner_mutations'
import { CreateProductModal } from './store-owner/create-product-modal'
import { EditProductModal } from './store-owner/edit-product-modal'
import { formatCurrency } from '../lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  CANTEEN_FOOD: 'Alimento',
  CANTEEN_DRINK: 'Bebida',
  SCHOOL_SUPPLY: 'Material',
  PRIVILEGE: 'Privilegio',
  HOMEWORK_PASS: 'Passe Tarefa',
  UNIFORM: 'Uniforme',
  BOOK: 'Livro',
  MERCHANDISE: 'Mercadoria',
  DIGITAL: 'Digital',
  OTHER: 'Outro',
}

export function StoreOwnerProductsContainer() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  const { data, isLoading } = useQuery(useOwnProductsQueryOptions())
  const toggleActive = useToggleProductActive()
  const deleteProduct = useDeleteProduct()

  const products = (data as any)?.data ?? []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Todos os produtos da sua loja</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !products.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preco</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {product.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.paymentMode === 'POINTS_ONLY'
                        ? `${product.price} pts`
                        : formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>
                      {product.totalStock !== null ? product.totalStock : '\u221E'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={() => toggleActive.mutate(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este produto?')) {
                                deleteProduct.mutate(product.id)
                              }
                            }}
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
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => setCreateOpen(false)}
      />

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onSuccess={() => setEditingProduct(null)}
        />
      )}
    </>
  )
}
