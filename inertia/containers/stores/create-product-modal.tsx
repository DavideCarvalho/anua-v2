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
import { api } from '~/lib/api'
import { reaisStringToCents } from '~/lib/currency_input_adapter'

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

function isCategoryValue(value: string): value is (typeof CATEGORIES)[number]['value'] {
  return CATEGORIES.some((item) => item.value === value)
}

export function CreateProductModal({ storeId, open, onOpenChange, onSuccess }: Props) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['value']>('OTHER')
  const [totalStock, setTotalStock] = useState('')

  const createMutation = useMutation(api.api.v1.storeItems.store.mutationOptions())
  const selectedCategoryLabel = CATEGORIES.find((item) => item.value === category)?.label ?? 'Outro'

  function resetForm() {
    setName('')
    setDescription('')
    setPrice('0')
    setCategory('OTHER')
    setTotalStock('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        body: {
          storeId,
          name,
          description: description || undefined,
          price: reaisStringToCents(price),
          category,
          paymentMode: 'MONEY_ONLY',
          totalStock: totalStock ? Number(totalStock) : undefined,
        },
      })
      queryClient.invalidateQueries({ queryKey: api.api.v1.storeItems.index.pathKey() })
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
                value={reaisStringToCents(price)}
                onChange={(cents) => setPrice(String(cents / 100))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-category">Categoria</Label>
              <Select
                value={category}
                onValueChange={(value: string | null) => {
                  if (!value) return
                  if (isCategoryValue(value)) {
                    setCategory(value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue>{selectedCategoryLabel}</SelectValue>
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
