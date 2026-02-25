import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useCreateCanteen } from '../../hooks/mutations/use_canteen_mutations'
import type { SharedProps } from '../../lib/types'

interface CanteenSummary {
  id: string
  name: string
  schoolId: string
  responsibleUserId: string
  createdAt?: string
}

interface PageProps extends SharedProps {
  canteenId?: string | null
  canteens?: CanteenSummary[]
}

export function CanteenContextBar() {
  const { props, url } = usePage<PageProps>()
  const createCanteen = useCreateCanteen()
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCanteenName, setNewCanteenName] = useState('')

  const canteens = props.canteens ?? []
  const canteenId = props.canteenId ?? null

  const updateUrlCanteen = (nextCanteenId: string) => {
    const [path, queryString] = url.split('?')
    const params = new URLSearchParams(queryString ?? '')
    params.set('canteenId', nextCanteenId)
    window.location.href = `${path}?${params.toString()}`
  }

  const handleCreateCanteen = async () => {
    if (isCreating) {
      return
    }

    const schoolId = props.selectedSchoolIds[0]
    const responsibleUserId = props.user?.id

    if (!schoolId || !responsibleUserId) {
      toast.error('Não foi possível identificar escola/usuário para criar cantina')
      return
    }

    const name = newCanteenName.trim()
    if (!name) {
      toast.error('Informe um nome para a cantina')
      return
    }

    setIsCreating(true)
    try {
      const canteen = await createCanteen.mutateAsync({
        name,
        schoolId,
        responsibleUserId,
      })

      toast.success('Cantina criada com sucesso')
      setIsDialogOpen(false)
      setNewCanteenName('')
      updateUrlCanteen(canteen.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar cantina')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {canteens.length === 0
            ? 'Nenhuma cantina cadastrada para esta escola.'
            : `Cantinas cadastradas: ${canteens.length}`}
        </p>

        <div className="flex items-center gap-2">
          {canteens.length > 1 && canteenId && (
            <Select value={canteenId} onValueChange={updateUrlCanteen}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione a cantina" />
              </SelectTrigger>
              <SelectContent>
                {canteens.map((canteen, index) => (
                  <SelectItem key={canteen.id} value={canteen.id}>
                    {canteen.name || `Cantina ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button variant="outline" onClick={() => setIsDialogOpen(true)} disabled={isCreating}>
            Nova Cantina
          </Button>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewCanteenName('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Cantina</DialogTitle>
            <DialogDescription>Informe um nome para criar uma nova cantina.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="canteen-name">Nome</Label>
            <Input
              id="canteen-name"
              value={newCanteenName}
              onChange={(event) => setNewCanteenName(event.target.value)}
              placeholder="Ex: Cantina Principal"
              disabled={isCreating}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCanteen} disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar cantina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
