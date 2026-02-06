import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { CurrencyInput } from '../../components/ui/currency-input'
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
import { useCreateStoreItemMutationOptions } from '../../hooks/mutations/use_create_store_item'

interface Props {
  storeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
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
] as const

export function CreateProductModal({ storeId, open, onOpenChange, onSuccess }: Props) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<string>('OTHER')
  const [totalStock, setTotalStock] = useState('')

  const createMutation = useMutation(useCreateStoreItemMutationOptions())

  function resetForm() {
    setName('')
    setDescription('')
    setPrice('')
    setCategory('OTHER')
    setTotalStock('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        storeId,
        name,
        description: description || undefined,
        price: Math.round(Number(price) * 100),
        category,
        paymentMode: 'MONEY_ONLY',
        totalStock: totalStock ? Number(totalStock) : undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['storeItems'] })
      toast.success('Produto criado com sucesso!')
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Erro ao criar produto.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Nome</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">Descrição</Label>
            <Textarea
              id="create-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-price">Preço</Label>
              <CurrencyInput
                id="create-price"
                value={price}
                onChange={setPrice}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-category">Categoria</Label>
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
            <Label htmlFor="create-totalStock">Estoque (deixe vazio para ilimitado)</Label>
            <Input
              id="create-totalStock"
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
