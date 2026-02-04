import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Props {
  product: any
  storeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORIES = [
  { value: 'SCHOOL_SUPPLY', label: 'Material Escolar' },
  { value: 'PRIVILEGE', label: 'Privilégio' },
  { value: 'HOMEWORK_PASS', label: 'Passe de Tarefa' },
  { value: 'UNIFORM', label: 'Uniforme' },
  { value: 'BOOK', label: 'Livro' },
  { value: 'MERCHANDISE', label: 'Mercadoria' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'OTHER', label: 'Outro' },
]

async function updateStoreItem(id: string, data: Record<string, unknown>) {
  const response = await fetch(`/api/v1/store-items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update item')
  return response.json()
}

export function EditProductModal({ product, storeId, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? '')
  const [price, setPrice] = useState(String(product.price))
  const [category, setCategory] = useState(product.category)
  const [totalStock, setTotalStock] = useState(
    product.totalStock !== null && product.totalStock !== undefined
      ? String(product.totalStock)
      : ''
  )

  useEffect(() => {
    setName(product.name)
    setDescription(product.description ?? '')
    setPrice(String(product.price))
    setCategory(product.category)
    setTotalStock(
      product.totalStock !== null && product.totalStock !== undefined
        ? String(product.totalStock)
        : ''
    )
  }, [product])

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateStoreItem(product.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeItems', storeId] })
      toast.success('Produto atualizado com sucesso!')
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Erro ao atualizar produto.')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateMutation.mutate({
      name,
      description: description || undefined,
      price: Number(price),
      category,
      totalStock: totalStock ? Number(totalStock) : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preço (centavos)</Label>
              <Input
                id="edit-price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-totalStock">Estoque (deixe vazio para ilimitado)</Label>
            <Input
              id="edit-totalStock"
              type="number"
              min="0"
              value={totalStock}
              onChange={(e) => setTotalStock(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
