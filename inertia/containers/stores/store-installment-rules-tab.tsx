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
import { CurrencyInput } from '../../components/ui/currency-input'
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
import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'

interface StoreInstallmentRulesTabProps {
  storeId: string
}

type StoreInstallmentRulesIndex = Awaited<Route.Response<'api.v1.store_installment_rules.index'>>
type StoreInstallmentRuleRow = StoreInstallmentRulesIndex[number]

export function StoreInstallmentRulesTab({ storeId }: StoreInstallmentRulesTabProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<StoreInstallmentRuleRow | null>(null)
  const [minInstallmentAmount, setMinInstallmentAmount] = useState('')
  const [maxInstallments, setMaxInstallments] = useState('')

  const queryClient = useQueryClient()

  const { data: rulesResponse, isLoading } = useQuery(
    api.api.v1.storeInstallmentRules.index.queryOptions({ query: { storeId } })
  )

  const rulesList: StoreInstallmentRulesIndex = rulesResponse ?? []

  const createMutation = useMutation(api.api.v1.storeInstallmentRules.store.mutationOptions())
  const updateMutation = useMutation(api.api.v1.storeInstallmentRules.update.mutationOptions())
  const deleteMutation = useMutation(api.api.v1.storeInstallmentRules.destroy.mutationOptions())

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        body: {
          storeId,
          minInstallmentAmount: Math.round(Number(minInstallmentAmount) * 100),
          maxInstallments: maxInstallments ? Number(maxInstallments) : undefined,
        },
      })
      queryClient.invalidateQueries({ queryKey: api.api.v1.storeInstallmentRules.index.pathKey() })
      toast.success('Regra criada com sucesso!')
      setCreateOpen(false)
      setMinInstallmentAmount('')
      setMaxInstallments('')
    } catch {
      toast.error('Erro ao criar regra.')
    }
  }

  const handleEdit = (rule: StoreInstallmentRuleRow) => {
    setEditingRule(rule)
    setMinInstallmentAmount(String(rule.minInstallmentAmount / 100))
    setMaxInstallments(rule.maxInstallments ? String(rule.maxInstallments) : '')
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingRule) return
    try {
      await updateMutation.mutateAsync({
        params: { id: editingRule.id },
        body: {
          minInstallmentAmount: Math.round(Number(minInstallmentAmount) * 100),
          maxInstallments: maxInstallments ? Number(maxInstallments) : undefined,
        },
      })
      queryClient.invalidateQueries({ queryKey: api.api.v1.storeInstallmentRules.index.pathKey() })
      toast.success('Regra atualizada com sucesso!')
      setEditingRule(null)
      setMinInstallmentAmount('')
      setMaxInstallments('')
    } catch {
      toast.error('Erro ao atualizar regra.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync({ params: { id } })
      queryClient.invalidateQueries({ queryKey: api.api.v1.storeInstallmentRules.index.pathKey() })
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
            <CardTitle>Parcelamento</CardTitle>
            <CardDescription>
              Configure o valor mínimo de cada parcela e o limite máximo de parcelas
            </CardDescription>
          </div>
          {!rulesList.length && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Configurar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !rulesList.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma configuração de parcelamento. Configure para permitir parcelas nas vendas.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela mínima</TableHead>
                  <TableHead>Parcelas máximas</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulesList.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      {rule.minInstallmentAmount > 0
                        ? formatCurrency(rule.minInstallmentAmount)
                        : 'Sem limite'}
                    </TableCell>
                    <TableCell>{rule.maxInstallments ?? 12}x</TableCell>
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
              <DialogTitle>Configurar Parcelamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="minInstallmentAmount">Valor mínimo da parcela (R$)</Label>
                <CurrencyInput
                  id="minInstallmentAmount"
                  value={Math.round(Number(minInstallmentAmount) * 100)}
                  onChange={(cents) => setMinInstallmentAmount(String(cents / 100))}
                  placeholder="R$ 30,00 (0 = sem limite)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxInstallments">Parcelas máximas (opcional, padrão: 12)</Label>
                <Input
                  id="maxInstallments"
                  type="number"
                  min="2"
                  max="24"
                  value={maxInstallments}
                  onChange={(e) => setMaxInstallments(e.target.value)}
                  placeholder="Ex: 12"
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
            setMinInstallmentAmount('')
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
                <Label htmlFor="edit-minInstallmentAmount">Valor mínimo da parcela (R$)</Label>
                <CurrencyInput
                  id="edit-minInstallmentAmount"
                  value={Math.round(Number(minInstallmentAmount) * 100)}
                  onChange={(cents) => setMinInstallmentAmount(String(cents / 100))}
                  placeholder="R$ 30,00 (0 = sem limite)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxInstallments">
                  Parcelas máximas (opcional, padrão: 12)
                </Label>
                <Input
                  id="edit-maxInstallments"
                  type="number"
                  min="2"
                  max="24"
                  value={maxInstallments}
                  onChange={(e) => setMaxInstallments(e.target.value)}
                  placeholder="Ex: 12"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingRule(null)
                  setMinInstallmentAmount('')
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
