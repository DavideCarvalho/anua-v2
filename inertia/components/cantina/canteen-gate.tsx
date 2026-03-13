import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, UtensilsCrossed, Check, ChevronsUpDown } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { api } from '~/lib/api'
import { cn } from '~/lib/utils'
import type { SharedProps } from '../../lib/types'
import { useDebounce } from '~/hooks/use_debounce'

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

  const [responsibleSearch, setResponsibleSearch] = useState('')
  const [responsiblePopoverOpen, setResponsiblePopoverOpen] = useState(false)
  const [selectedResponsible, setSelectedResponsible] = useState<{
    id: string
    name: string
    email: string | null
  } | null>(null)
  const [createNewResponsible, setCreateNewResponsible] = useState(false)
  const [newResponsibleName, setNewResponsibleName] = useState('')
  const [newResponsibleEmail, setNewResponsibleEmail] = useState('')

  const debouncedSearch = useDebounce(responsibleSearch, 300)

  const { data: employeesData } = useQuery({
    ...api.api.v1.users.schoolEmployees.queryOptions({
      query: { search: debouncedSearch, limit: 10 },
    }),
    enabled: isDialogOpen,
  })
  const employees = employeesData?.data ?? []

  const canteens = props.canteens ?? []
  const canteenId = props.canteenId ?? null

  const updateUrlCanteen = (nextCanteenId: string | null) => {
    if (!nextCanteenId) return
    const [path, queryString] = url.split('?')
    const params = new URLSearchParams(queryString ?? '')
    params.set('canteenId', nextCanteenId)
    window.location.href = `${path}?${params.toString()}`
  }

  const resetForm = () => {
    setNewCanteenName('')
    setSelectedResponsible(null)
    setCreateNewResponsible(false)
    setNewResponsibleName('')
    setNewResponsibleEmail('')
    setResponsibleSearch('')
  }

  const handleCreateCanteen = async () => {
    if (isCreating) return

    const schoolId = props.selectedSchoolIds[0]
    if (!schoolId) {
      toast.error('Não foi possível identificar escola para criar cantina')
      return
    }

    const name = newCanteenName.trim()
    if (!name) {
      toast.error('Informe um nome para a cantina')
      return
    }

    if (createNewResponsible) {
      if (!newResponsibleName.trim() || !newResponsibleEmail.trim()) {
        toast.error('Informe nome e email do novo responsável')
        return
      }
    } else if (!selectedResponsible) {
      toast.error('Selecione ou crie um responsável')
      return
    }

    setIsCreating(true)
    try {
      const body = createNewResponsible
        ? {
            name,
            schoolId,
            responsibleUser: {
              name: newResponsibleName.trim(),
              email: newResponsibleEmail.trim(),
            },
          }
        : {
            name,
            schoolId,
            responsibleUserId: selectedResponsible!.id,
          }

      const canteen = await createCanteen.mutateAsync({ body })
      queryClient.invalidateQueries({ queryKey: api.api.v1.canteens.index.pathKey() })
      toast.success('Cantina criada com sucesso')
      setIsDialogOpen(false)
      resetForm()
      const newId = (canteen as any)?.json?.id ?? (canteen as any)?.id
      updateUrlCanteen(newId)
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
        if (!open) resetForm()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Cantina</DialogTitle>
          <DialogDescription>Preencha os dados para criar uma nova cantina.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo: Nome da cantina */}
          <div className="space-y-2">
            <Label htmlFor="canteen-name">Nome da cantina</Label>
            <Input
              id="canteen-name"
              value={newCanteenName}
              onChange={(e) => setNewCanteenName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCanteen()
              }}
              placeholder="Ex: Cantina Principal"
              disabled={isCreating}
            />
          </div>

          {/* Campo: Responsável */}
          <div className="space-y-2">
            <Label>Responsável</Label>
            {!createNewResponsible ? (
              <Popover open={responsiblePopoverOpen} onOpenChange={setResponsiblePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={responsiblePopoverOpen}
                    className="w-full justify-between font-normal"
                    disabled={isCreating}
                    type="button"
                  >
                    {selectedResponsible ? selectedResponsible.name : 'Buscar responsável...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Buscar por nome ou email..."
                      value={responsibleSearch}
                      onValueChange={setResponsibleSearch}
                    />
                    <CommandList>
                      {employees.length === 0 && (
                        <CommandEmpty>
                          {responsibleSearch
                            ? 'Nenhum resultado encontrado.'
                            : 'Digite para buscar funcionários.'}
                        </CommandEmpty>
                      )}
                      {employees.length > 0 && (
                        <CommandGroup heading="Funcionários da escola">
                          {employees.map(
                            (employee: { id: string; name: string; email: string | null }) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.id}
                                onSelect={() => {
                                  setSelectedResponsible(employee)
                                  setResponsiblePopoverOpen(false)
                                  setResponsibleSearch('')
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedResponsible?.id === employee.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{employee.name}</span>
                                  {employee.email && (
                                    <span className="text-xs text-muted-foreground">
                                      {employee.email}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            )
                          )}
                        </CommandGroup>
                      )}
                      <CommandGroup>
                        <CommandItem
                          value="__create_new__"
                          onSelect={() => {
                            setCreateNewResponsible(true)
                            setNewResponsibleName(responsibleSearch)
                            setResponsiblePopoverOpen(false)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {responsibleSearch
                            ? `Criar "${responsibleSearch}" como novo responsável`
                            : 'Criar novo responsável'}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Novo responsável
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setCreateNewResponsible(false)
                      setNewResponsibleName('')
                      setNewResponsibleEmail('')
                    }}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsible-name">Nome</Label>
                  <Input
                    id="responsible-name"
                    value={newResponsibleName}
                    onChange={(e) => setNewResponsibleName(e.target.value)}
                    placeholder="Nome completo"
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsible-email">Email</Label>
                  <Input
                    id="responsible-email"
                    type="email"
                    value={newResponsibleEmail}
                    onChange={(e) => setNewResponsibleEmail(e.target.value)}
                    placeholder="email@escola.com.br"
                    disabled={isCreating}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isCreating}
            type="button"
          >
            Cancelar
          </Button>
          <Button onClick={handleCreateCanteen} disabled={isCreating} type="button">
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
            <SelectValue placeholder="Selecione a cantina">
              {canteens.find((c) => c.id === canteenId)?.name ?? 'Selecione a cantina'}
            </SelectValue>
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
