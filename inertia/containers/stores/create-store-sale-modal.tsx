import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Minus, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { formatCurrency } from '../../lib/utils'
import { useStudentsQueryOptions } from '../../hooks/queries/use_students'
import { useStoreItemsQueryOptions } from '../../hooks/queries/use_stores'
import {
  useCreateStoreOrderMutationOptions,
  type CreateStoreOrderPayload,
} from '../../hooks/mutations/use_create_store_order'

interface CreateStoreSaleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  schoolId: string
}

type StudentSummary = {
  id: string
  name: string
}

export function CreateStoreSaleModal({
  open,
  onOpenChange,
  storeId,
  schoolId,
}: CreateStoreSaleModalProps) {
  const queryClient = useQueryClient()
  const createOrder = useMutation(useCreateStoreOrderMutationOptions())

  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [paymentMode, setPaymentMode] = useState<'IMMEDIATE' | 'DEFERRED'>('IMMEDIATE')
  const [paymentMethod, setPaymentMethod] = useState<'BALANCE' | 'PIX' | 'CASH' | 'CARD'>('CASH')
  const [installments, setInstallments] = useState(1)
  const [notes, setNotes] = useState('')

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    ...useStudentsQueryOptions({ search: studentSearch || undefined, limit: 15 }),
    enabled: open,
  })

  const { data: storeItemsData, isLoading: isLoadingItems } = useQuery({
    ...useStoreItemsQueryOptions({ storeId, isActive: true, limit: 100 }),
    enabled: open,
  })

  const students = studentsData?.data ?? []
  const items = storeItemsData?.data ?? []

  const selectedItems = useMemo(() => {
    return items
      .map((item) => ({ item, quantity: quantities[item.id] ?? 0 }))
      .filter((entry) => entry.quantity > 0)
  }, [items, quantities])

  const totalMoney = useMemo(() => {
    return selectedItems.reduce((acc, entry) => acc + entry.item.price * entry.quantity, 0)
  }, [selectedItems])

  function resetForm() {
    setStudentSearch('')
    setSelectedStudent(null)
    setQuantities({})
    setPaymentMode('IMMEDIATE')
    setPaymentMethod('CASH')
    setInstallments(1)
    setNotes('')
  }

  function handleClose(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetForm()
    }
  }

  function updateQuantity(itemId: string, value: number, maxStock: number | null) {
    const nextQuantity = Math.max(0, value)
    const clamped = maxStock === null ? nextQuantity : Math.min(nextQuantity, maxStock)

    setQuantities((prev) => {
      if (clamped <= 0) {
        const { [itemId]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [itemId]: clamped }
    })
  }

  async function handleCreateSale() {
    if (!selectedStudent) {
      toast.error('Selecione um aluno para registrar a venda')
      return
    }

    if (!selectedItems.length) {
      toast.error('Adicione ao menos um item na venda')
      return
    }

    const payload: CreateStoreOrderPayload = {
      studentId: selectedStudent.id,
      schoolId,
      storeId,
      items: selectedItems.map((entry) => ({
        storeItemId: entry.item.id,
        quantity: entry.quantity,
      })),
      paymentMode,
      paymentMethod: paymentMode === 'IMMEDIATE' ? paymentMethod : undefined,
      installments: paymentMode === 'DEFERRED' ? installments : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    }

    try {
      await createOrder.mutateAsync(payload)
      toast.success('Venda registrada com sucesso!')

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['storeOrders'] }),
        queryClient.invalidateQueries({ queryKey: ['storeItems'] }),
      ])

      handleClose(false)
    } catch {
      toast.error('Erro ao registrar venda')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Nova venda
          </DialogTitle>
          <DialogDescription>
            Selecione aluno, itens e forma de pagamento para registrar uma venda nesta loja.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 overflow-y-auto pr-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Aluno</Label>
              <Input
                placeholder="Buscar aluno por nome ou email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />

              <div className="rounded-md border max-h-44 overflow-y-auto">
                {isLoadingStudents ? (
                  <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando alunos...
                  </div>
                ) : !students.length ? (
                  <p className="p-4 text-sm text-muted-foreground">Nenhum aluno encontrado</p>
                ) : (
                  <div className="p-1">
                    {students.map((student) => {
                      const studentName = student.user?.name ?? 'Sem nome'
                      const isSelected = selectedStudent?.id === student.id

                      return (
                        <button
                          key={student.id}
                          type="button"
                          className={`w-full rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${
                            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedStudent({ id: student.id, name: studentName })}
                        >
                          <p className="font-medium truncate">{studentName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.user?.email ?? '-'}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <p className="text-xs text-muted-foreground">
                  Aluno selecionado: <span className="font-medium">{selectedStudent.name}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pagamento</Label>
              <Select
                value={paymentMode}
                onValueChange={(value) => setPaymentMode(value as 'IMMEDIATE' | 'DEFERRED')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modo de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMMEDIATE">Pagamento imediato</SelectItem>
                  <SelectItem value="DEFERRED">Na mensalidade (fatura)</SelectItem>
                </SelectContent>
              </Select>

              {paymentMode === 'IMMEDIATE' ? (
                <Select
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as 'BALANCE' | 'PIX' | 'CASH' | 'CARD')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="CARD">Cartão</SelectItem>
                    <SelectItem value="BALANCE">Saldo</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    min={1}
                    max={12}
                    value={installments}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (Number.isNaN(value)) return
                      setInstallments(Math.max(1, Math.min(12, value)))
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea
                id="notes"
                placeholder="Opcional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Itens da venda</Label>
            <div className="rounded-md border max-h-[380px] overflow-y-auto">
              {isLoadingItems ? (
                <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando itens...
                </div>
              ) : !items.length ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Nenhum item disponivel nesta loja
                </p>
              ) : (
                <div className="divide-y">
                  {items.map((item) => {
                    const quantity = quantities[item.id] ?? 0
                    const maxStock = item.totalStock
                    const isOutOfStock = maxStock !== null && maxStock <= 0
                    const reachedStockLimit = maxStock !== null && quantity >= maxStock

                    return (
                      <div key={item.id} className="p-3 flex items-center gap-3 justify-between">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{formatCurrency(item.price)}</span>
                            <span>Estoque: {maxStock === null ? '∞' : maxStock}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, quantity - 1, maxStock)}
                            disabled={quantity <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-7 text-center text-sm">{quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, quantity + 1, maxStock)}
                            disabled={isOutOfStock || reachedStockLimit}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-md border p-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Itens selecionados</span>
                <Badge variant="outline">{selectedItems.length}</Badge>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalMoney)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={createOrder.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreateSale} disabled={createOrder.isPending || totalMoney <= 0}>
            {createOrder.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Registrar venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
