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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { usePage } from '@inertiajs/react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '~/lib/api'
import type { SharedProps } from '../../lib/types'
import { cn } from '~/lib/utils'
import { useDebounce } from '~/hooks/use_debounce'
import { NewEmployeeModal } from '../employees/new-employee-modal'

interface CreateStoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateStoreModal({ open, onOpenChange, onSuccess }: CreateStoreModalProps) {
  const { props } = usePage<SharedProps>()
  const queryClient = useQueryClient()
  const createStore = useMutation(api.api.v1.stores.store.mutationOptions())

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'INTERNAL' | 'THIRD_PARTY'>('INTERNAL')
  const [commissionPercentage, setCommissionPercentage] = useState('')
  const [ownerSearch, setOwnerSearch] = useState('')
  const [ownerPopoverOpen, setOwnerPopoverOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<{
    id: string
    name: string
    email: string | null
  } | null>(null)
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false)

  const schoolId = props.selectedSchoolIds?.[0] ?? ''
  const debouncedOwnerSearch = useDebounce(ownerSearch, 300)

  const { data: employeesData, refetch: refetchEmployees } = useQuery({
    ...api.api.v1.users.schoolEmployees.queryOptions({
      query: { search: debouncedOwnerSearch, limit: 10 },
    }),
    enabled: open && type === 'THIRD_PARTY',
  })

  const employees = employeesData?.data ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!schoolId) return

    if (type === 'THIRD_PARTY' && !selectedOwner) {
      toast.error('Selecione um responsável para loja terceirizada')
      return
    }

    try {
      await createStore.mutateAsync({
        body: {
          schoolId,
          name,
          type,
          description: description || undefined,
          ownerUserId: type === 'THIRD_PARTY' ? selectedOwner?.id : undefined,
          commissionPercentage:
            type === 'THIRD_PARTY' && commissionPercentage
              ? Number(commissionPercentage)
              : undefined,
        },
      })

      queryClient.invalidateQueries({ queryKey: api.api.v1.stores.index.pathKey() })
      toast.success('Loja criada com sucesso!')
      setName('')
      setDescription('')
      setType('INTERNAL')
      setCommissionPercentage('')
      setOwnerSearch('')
      setSelectedOwner(null)
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
            <DialogDescription>Crie uma nova loja para a instituição</DialogDescription>
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
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da loja (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  const nextType = v as 'INTERNAL' | 'THIRD_PARTY'
                  setType(nextType)
                  if (nextType === 'INTERNAL') {
                    setSelectedOwner(null)
                    setOwnerSearch('')
                    setCommissionPercentage('')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {type === 'INTERNAL' ? 'Interna (da escola)' : 'Terceirizada'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Interna (da escola)</SelectItem>
                  <SelectItem value="THIRD_PARTY">Terceirizada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'THIRD_PARTY' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Responsável</Label>
                    {schoolId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewEmployeeOpen(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Cadastrar novo
                      </Button>
                    )}
                  </div>
                  <Popover open={ownerPopoverOpen} onOpenChange={setOwnerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={ownerPopoverOpen}
                        className="w-full justify-between font-normal"
                      >
                        {selectedOwner ? selectedOwner.name : 'Buscar funcionário da escola...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Buscar por nome ou email..."
                          value={ownerSearch}
                          onValueChange={setOwnerSearch}
                        />
                        <CommandList>
                          {employees.length === 0 && (
                            <CommandEmpty>
                              {ownerSearch
                                ? 'Nenhum funcionário encontrado.'
                                : 'Digite para buscar funcionários.'}
                            </CommandEmpty>
                          )}
                          {employees.length > 0 && (
                            <CommandGroup heading="Funcionários da escola">
                              {employees.map((employee) => (
                                <CommandItem
                                  key={employee.id}
                                  value={employee.id}
                                  onSelect={() => {
                                    setSelectedOwner(employee)
                                    setOwnerPopoverOpen(false)
                                    setOwnerSearch('')
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedOwner?.id === employee.id
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
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission">Comissão (%)</Label>
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
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                createStore.isPending || !name || (type === 'THIRD_PARTY' && !selectedOwner)
              }
            >
              {createStore.isPending ? 'Criando...' : 'Criar Loja'}
            </Button>
          </DialogFooter>
        </form>

        {schoolId && (
          <NewEmployeeModal
            schoolId={schoolId}
            open={newEmployeeOpen}
            onOpenChange={(isOpen) => {
              setNewEmployeeOpen(isOpen)
              if (!isOpen) {
                refetchEmployees()
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
