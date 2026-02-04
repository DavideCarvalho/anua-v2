import { useState } from 'react'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'

interface StoreInstallmentRulesTabProps {
  storeId: string
}

async function fetchRules(storeId: string) {
  const response = await fetch(`/api/v1/store-installment-rules?storeId=${storeId}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch rules')
  return response.json()
}

async function createRule(data: { storeId: string; minAmount: number; maxInstallments: number }) {
  const response = await fetch('/api/v1/store-installment-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create rule')
  return response.json()
}

async function updateRule(id: string, data: { minAmount: number; maxInstallments: number }) {
  const response = await fetch(`/api/v1/store-installment-rules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to update rule')
  return response.json()
}

async function deleteRule(id: string) {
  const response = await fetch(`/api/v1/store-installment-rules/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to delete rule')
}

export function StoreInstallmentRulesTab({ storeId }: StoreInstallmentRulesTabProps) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)
  const [minAmount, setMinAmount] = useState('')
  const [maxInstallments, setMaxInstallments] = useState('')

  const { data: rules, isLoading } = useQuery({
    queryKey: ['storeInstallmentRules', storeId],
    queryFn: () => fetchRules(storeId),
  })

  const createMutation = useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeInstallmentRules', storeId] })
      toast.success('Regra criada com sucesso!')
      setCreateOpen(false)
      setMinAmount('')
      setMaxInstallments('')
    },
    onError: () => {
      toast.error('Erro ao criar regra.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; minAmount: number; maxInstallments: number }) =>
      updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeInstallmentRules', storeId] })
      toast.success('Regra atualizada com sucesso!')
      setEditingRule(null)
      setMinAmount('')
      setMaxInstallments('')
    },
    onError: () => {
      toast.error('Erro ao atualizar regra.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeInstallmentRules', storeId] })
      toast.success('Regra excluída com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir regra.')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      storeId,
      minAmount: Math.round(Number(minAmount) * 100),
      maxInstallments: Number(maxInstallments),
    })
  }

  const handleEdit = (rule: any) => {
    setEditingRule(rule)
    setMinAmount(String(rule.minAmount / 100))
    setMaxInstallments(String(rule.maxInstallments))
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      id: editingRule.id,
      minAmount: Math.round(Number(minAmount) * 100),
      maxInstallments: Number(maxInstallments),
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Regras de Parcelamento</CardTitle>
            <CardDescription>
              Defina faixas de valor e o número máximo de parcelas para cada faixa
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Regra
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !rules?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma regra cadastrada. Sem regras, parcelamento não fica disponível.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor mínimo</TableHead>
                  <TableHead>Parcelas máximas</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule: any) => (
                  <TableRow key={rule.id}>
                    <TableCell>{formatCurrency(rule.minAmount)}</TableCell>
                    <TableCell>{rule.maxInstallments}x</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(rule)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteMutation.mutate(rule.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Nova Regra de Parcelamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Valor mínimo (R$)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Ex: 50.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxInstallments">Parcelas máximas</Label>
                <Input
                  id="maxInstallments"
                  type="number"
                  min="2"
                  max="24"
                  value={maxInstallments}
                  onChange={(e) => setMaxInstallments(e.target.value)}
                  placeholder="Ex: 3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Criando...' : 'Criar Regra'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingRule}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRule(null)
            setMinAmount('')
            setMaxInstallments('')
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Editar Regra de Parcelamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-minAmount">Valor mínimo (R$)</Label>
                <Input
                  id="edit-minAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Ex: 50.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxInstallments">Parcelas máximas</Label>
                <Input
                  id="edit-maxInstallments"
                  type="number"
                  min="2"
                  max="24"
                  value={maxInstallments}
                  onChange={(e) => setMaxInstallments(e.target.value)}
                  placeholder="Ex: 3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingRule(null)
                  setMinAmount('')
                  setMaxInstallments('')
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
