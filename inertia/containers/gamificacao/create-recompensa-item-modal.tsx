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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/lib/api'

const CATEGORIES = [
  { value: 'SCHOOL_SUPPLY', label: 'Material Escolar' },
  { value: 'PRIVILEGE', label: 'Privilégio' },
  { value: 'HOMEWORK_PASS', label: 'Passe de Tarefa' },
  { value: 'UNIFORM', label: 'Uniforme' },
  { value: 'BOOK', label: 'Livro' },
  { value: 'MERCHANDISE', label: 'Mercadoria' },
  { value: 'DIGITAL', label: 'Digital' },
  { value: 'OTHER', label: 'Outro' },
  { value: 'AVATAR_HAIR', label: 'Cabelo (Avatar)' },
  { value: 'AVATAR_OUTFIT', label: 'Roupa (Avatar)' },
  { value: 'AVATAR_ACCESSORY', label: 'Acessório (Avatar)' },
] as const

type CategoryValue = (typeof CATEGORIES)[number]['value']

interface Props {
  schoolId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateRecompensaItemModal({
  schoolId,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<CategoryValue>('OTHER')
  const [totalStock, setTotalStock] = useState('')

  const createMutation = useMutation(api.api.v1.storeItems.store.mutationOptions())

  function resetForm() {
    setName('')
    setDescription('')
    setPrice('')
    setCategory('OTHER')
    setTotalStock('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const priceNum = Number(price)
    if (!priceNum || priceNum < 1) {
      toast.error('Preço deve ser maior que zero')
      return
    }
    try {
      await createMutation.mutateAsync({
        body: {
          schoolId,
          name,
          description: description || undefined,
          price: Math.round(priceNum),
          category,
          paymentMode: 'POINTS_ONLY',
          totalStock: totalStock ? Number(totalStock) : undefined,
          requiresApproval: false,
        },
      })
      queryClient.invalidateQueries({ queryKey: ['store-items'] })
      toast.success('Item criado com sucesso!')
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Erro ao criar item.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Item de Recompensa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recompensa-name">Nome</Label>
            <Input
              id="recompensa-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recompensa-description">Descrição</Label>
            <Textarea
              id="recompensa-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recompensa-price">Preço (pontos)</Label>
              <Input
                id="recompensa-price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recompensa-category">Categoria</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as CategoryValue)}
              >
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
            <Label htmlFor="recompensa-stock">Estoque (deixe vazio para ilimitado)</Label>
            <Input
              id="recompensa-stock"
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
              {createMutation.isPending ? 'Salvando...' : 'Criar Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
