import { useState } from 'react'
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
import { useCreateProduct } from '../../hooks/mutations/use_store_owner_mutations'

interface Props {
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

export function CreateProductModal({ open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [totalStock, setTotalStock] = useState('')

  const createProduct = useCreateProduct()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    createProduct.mutate(
      {
        name,
        description: description || undefined,
        price: Number(price),
        category: category as any,
        paymentMode: 'MONEY_ONLY',
        totalStock: totalStock ? Number(totalStock) : undefined,
      } as any,
      {
        onSuccess: () => {
          setName('')
          setDescription('')
          setPrice('')
          setCategory('OTHER')
          setTotalStock('')
          onSuccess()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preco (centavos)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
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
            <Label htmlFor="totalStock">Estoque (deixe vazio para ilimitado)</Label>
            <Input
              id="totalStock"
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
            <Button type="submit" disabled={createProduct.isPending}>
              {createProduct.isPending ? 'Salvando...' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
