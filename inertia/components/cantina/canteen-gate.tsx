import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent } from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { api } from '~/lib/api'
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

interface CanteenGateProps {
  children: React.ReactNode
}

export function CanteenGate({ children }: CanteenGateProps) {
  const { props, url } = usePage<PageProps>()
  const queryClient = useQueryClient()
  const createCanteen = useMutation(api.api.v1.canteens.store.mutationOptions())
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCanteenName, setNewCanteenName] = useState('')

  const canteens = props.canteens ?? []
  const canteenId = props.canteenId ?? null

  const updateUrlCanteen = (nextCanteenId: string | null) => {
    if (!nextCanteenId) return
    const [path, queryString] = url.split('?')
    const params = new URLSearchParams(queryString ?? '')
    params.set('canteenId', nextCanteenId)
    window.location.href = `${path}?${params.toString()}`
  }

  const handleCreateCanteen = async () => {
    if (isCreating) return

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
        body: { name, schoolId, responsibleUserId },
      })
      queryClient.invalidateQueries({ queryKey: ['canteens'] })
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

  const createDialog = (
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
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleCreateCanteen()
              }
            }}
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
  )

  if (canteens.length === 0) {
    return (
      <>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Nenhuma cantina cadastrada</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Crie uma cantina para começar a gerenciar pedidos, cardápio e muito mais.
              </p>
            </div>

            <Button onClick={() => setIsDialogOpen(true)} disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" />
              Criar cantina
            </Button>
          </CardContent>
        </Card>

        {createDialog}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select value={canteenId ?? undefined} onValueChange={updateUrlCanteen}>
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

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Cantina
        </Button>
      </div>

      {children}

      {createDialog}
    </div>
  )
}
