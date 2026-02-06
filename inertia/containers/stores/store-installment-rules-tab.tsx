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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/utils'
import {
  useStoreInstallmentRulesQueryOptions,
  type StoreInstallmentRulesResponse,
} from '../../hooks/queries/use_stores'
import { useCreateStoreInstallmentRuleMutationOptions } from '../../hooks/mutations/use_create_store_installment_rule'
import { useUpdateStoreInstallmentRuleMutationOptions } from '../../hooks/mutations/use_update_store_installment_rule'
import { useDeleteStoreInstallmentRuleMutationOptions } from '../../hooks/mutations/use_delete_store_installment_rule'

interface StoreInstallmentRulesTabProps {
  storeId: string
}

type InstallmentRule = NonNullable<StoreInstallmentRulesResponse>['data'][number]

export function StoreInstallmentRulesTab({ storeId }: StoreInstallmentRulesTabProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<InstallmentRule | null>(null)
  const [minAmount, setMinAmount] = useState('')
  const [maxInstallments, setMaxInstallments] = useState('')

  const queryClient = useQueryClient()

  const { data: rulesData, isLoading } = useQuery(
    useStoreInstallmentRulesQueryOptions({ storeId })
  )

  const rulesList = rulesData?.data ?? []

  const createMutation = useMutation(useCreateStoreInstallmentRuleMutationOptions())
  const updateMutation = useMutation(useUpdateStoreInstallmentRuleMutationOptions())
  const deleteMutation = useMutation(useDeleteStoreInstallmentRuleMutationOptions())

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        storeId,
        minAmount: Math.round(Number(minAmount) * 100),
        maxInstallments: Number(maxInstallments),
      })
      queryClient.invalidateQueries({ queryKey: ['storeInstallmentRules'] })
      toast.success('Regra criada com sucesso!')
      setCreateOpen(false)
      setMinAmount('')
      setMaxInstallments('')
    } catch {
      toast.error('Erro ao criar regra.')
    }
  }

  const handleEdit = (rule: InstallmentRule) => {
    setEditingRule(rule)
    setMinAmount(String(rule.minAmount / 100))
    setMaxInstallments(String(rule.maxInstallments))
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingRule) return
    try {
      await updateMutation.mutateAsync({
        id: editingRule.id,
        minAmount: Math.round(Number(minAmount) * 100),
        maxInstallments: Number(maxInstallments),
      })
      queryClient.invalidateQueries({ queryKey: ['storeInstallmentRules'] })
      toast.success('Regra atualizada com sucesso!')
      setEditingRule(null)
      setMinAmount('')
      setMaxInstallments('')
    } catch {
      toast.error('Erro ao atualizar regra.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id)
      queryClient.invalidateQueries({ queryKey: ['storeInstallmentRules'] })
      toast.success('Regra excluída com sucesso!')
    } catch {
      toast.error('Erro ao excluir regra.')
    }
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
          ) : !rulesList.length ? (
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
                {rulesList.map((rule) => (
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
                            onClick={() => handleDelete(rule.id)}
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
