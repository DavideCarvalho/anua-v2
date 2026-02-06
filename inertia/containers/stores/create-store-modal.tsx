import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { useCreateStoreMutationOptions } from '../../hooks/mutations/use_create_store'
import type { SharedProps } from '../../lib/types'

interface CreateStoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateStoreModal({ open, onOpenChange, onSuccess }: CreateStoreModalProps) {
  const { props } = usePage<SharedProps>()
  const queryClient = useQueryClient()
  const createStore = useMutation(useCreateStoreMutationOptions())

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'INTERNAL' | 'THIRD_PARTY'>('INTERNAL')
  const [commissionPercentage, setCommissionPercentage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const schoolId = props.selectedSchoolIds?.[0]
    if (!schoolId) return

    try {
      await createStore.mutateAsync({
        schoolId,
        name,
        type,
        description: description || undefined,
        commissionPercentage:
          type === 'THIRD_PARTY' && commissionPercentage
            ? Number(commissionPercentage)
            : undefined,
      })

      queryClient.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Loja criada com sucesso!')
      setName('')
      setDescription('')
      setType('INTERNAL')
      setCommissionPercentage('')
      onSuccess()
    } catch {
      toast.error('Erro ao criar loja. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Loja</DialogTitle>
            <DialogDescription>Crie uma nova loja para a instituicao</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da loja"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descricao da loja (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as 'INTERNAL' | 'THIRD_PARTY')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Interna (da escola)</SelectItem>
                  <SelectItem value="THIRD_PARTY">Terceirizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'THIRD_PARTY' && (
              <div className="space-y-2">
                <Label htmlFor="commission">Comissao (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(e.target.value)}
                  placeholder="Ex: 10"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createStore.isPending || !name}>
              {createStore.isPending ? 'Criando...' : 'Criar Loja'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
