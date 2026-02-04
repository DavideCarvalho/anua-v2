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
import { useUpdateProduct } from '../../hooks/mutations/use_store_owner_mutations'

interface Props {
  product: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CATEGORIES = [
  { value: 'SCHOOL_SUPPLY', label: 'Material Escolar' },
  { value: 'UNIFORM', label: 'Uniforme' },
  { value: 'BOOK', label: 'Livro' },
  { value: 'MERCHANDISE', label: 'Mercadoria' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'OTHER', label: 'Outro' },
]

export function EditProductModal({ product, open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description ?? '')
  const [price, setPrice] = useState(String(product.price))
  const [category, setCategory] = useState(product.category)
  const [totalStock, setTotalStock] = useState(
    product.totalStock !== null ? String(product.totalStock) : ''
  )

  const updateProduct = useUpdateProduct()

  useEffect(() => {
    setName(product.name)
    setDescription(product.description ?? '')
    setPrice(String(product.price))
    setCategory(product.category)
    setTotalStock(product.totalStock !== null ? String(product.totalStock) : '')
  }, [product])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    updateProduct.mutate(
      {
        id: product.id,
        name,
        description: description || undefined,
        price: Number(price),
        category: category as any,
        totalStock: totalStock ? Number(totalStock) : undefined,
      } as any,
      { onSuccess }
    )
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
            <Label htmlFor="edit-description">Descricao</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Preco (centavos)</Label>
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
            <Button type="submit" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
