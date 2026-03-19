import { useEffect, useMemo, useRef, useState } from 'react'
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
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { formatCurrency } from '../../lib/utils'
import { api } from '~/lib/api'

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
  const createOrder = useMutation(api.api.v1.storeOrders.store.mutationOptions())

  const [studentSearch, setStudentSearch] = useState('')
  const [isStudentListOpen, setIsStudentListOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [itemSearch, setItemSearch] = useState('')
  const [paymentMode, setPaymentMode] = useState<'IMMEDIATE' | 'DEFERRED'>('IMMEDIATE')
  const [paymentMethod, setPaymentMethod] = useState<'BALANCE' | 'PIX' | 'CASH' | 'CARD'>('CASH')
  const [installments, setInstallments] = useState(1)
  const [notes, setNotes] = useState('')

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    ...api.api.v1.students.index.queryOptions({
      query: { search: studentSearch || undefined, limit: 15 },
    }),
    enabled: open,
  })

  const { data: storeItemsData, isLoading: isLoadingItems } = useQuery({
    ...api.api.v1.storeItems.index.queryOptions({
      query: { storeId, isActive: true, limit: 100 },
    }),
    enabled: open,
  })

  const students = studentsData?.data ?? []
  const items = storeItemsData?.data ?? []
  const studentPickerRef = useRef<HTMLDivElement | null>(null)

  const selectedItems = useMemo(() => {
    return items
      .map((item) => ({ item, quantity: quantities[item.id] ?? 0 }))
      .filter((entry) => entry.quantity > 0)
  }, [items, quantities])

  const filteredItems = useMemo(() => {
    const search = itemSearch.trim().toLowerCase()

    const base = search ? items.filter((item) => item.name.toLowerCase().includes(search)) : items

    return [...base].sort((a, b) => {
      const aq = quantities[a.id] ?? 0
      const bq = quantities[b.id] ?? 0
      if (aq > 0 && bq === 0) return -1
      if (bq > 0 && aq === 0) return 1
      return a.name.localeCompare(b.name)
    })
  }, [itemSearch, items, quantities])

  const totalMoney = useMemo(() => {
    return selectedItems.reduce((acc, entry) => acc + entry.item.price * entry.quantity, 0)
  }, [selectedItems])

  function resetForm() {
    setStudentSearch('')
    setIsStudentListOpen(false)
    setSelectedStudent(null)
    setQuantities({})
    setItemSearch('')
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!studentPickerRef.current) return
      if (!studentPickerRef.current.contains(event.target as Node)) {
        setIsStudentListOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

    const payload = {
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
      await createOrder.mutateAsync({ body: payload })
      toast.success('Venda registrada com sucesso!')

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: api.api.v1.storeOrders.index.pathKey() }),
        queryClient.invalidateQueries({ queryKey: api.api.v1.storeItems.index.pathKey() }),
      ])

      handleClose(false)
    } catch {
      toast.error('Erro ao registrar venda')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex w-[min(50vw,980px)] !max-w-none sm:!max-w-none max-h-[94vh] flex-col overflow-hidden p-0">
        <DialogHeader className="mb-0 border-b px-6 py-4 pr-14">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5" />
            Nova venda
          </DialogTitle>
          <DialogDescription>
            Selecione aluno, itens e forma de pagamento para registrar uma venda nesta loja.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1fr_1.2fr]">
          <div className="min-h-0 min-w-0 space-y-5 overflow-y-auto px-6 py-5">
            <div ref={studentPickerRef} className="relative space-y-2">
              <Label>Aluno</Label>
              <Input
                placeholder="Buscar aluno por nome ou email..."
                value={studentSearch}
                onFocus={() => setIsStudentListOpen(true)}
                onChange={(e) => {
                  setStudentSearch(e.target.value)
                  setIsStudentListOpen(true)
                }}
              />

              {isStudentListOpen ? (
                <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
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
                            onClick={() => {
                              setSelectedStudent({ id: student.id, name: studentName })
                              setStudentSearch(studentName)
                              setIsStudentListOpen(false)
                            }}
                          >
                            <p className="font-medium truncate">{studentName}</p>
                            {student.user?.email ? (
                              <p className="text-xs text-muted-foreground truncate">
                                {student.user.email}
                              </p>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : null}

              {selectedStudent && (
                <p className="text-xs text-muted-foreground">
                  Aluno selecionado: <span className="font-medium">{selectedStudent.name}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pagamento</Label>
              <select
                className="flex h-10 w-full appearance-none items-center rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as 'IMMEDIATE' | 'DEFERRED')}
              >
                <option value="IMMEDIATE">Pagamento imediato</option>
                <option value="DEFERRED">Na mensalidade (fatura)</option>
              </select>

              {paymentMode === 'IMMEDIATE' ? (
                <select
                  className="flex h-10 w-full appearance-none items-center rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'BALANCE' | 'PIX' | 'CASH' | 'CARD')
                  }
                >
                  <option value="CASH">Dinheiro</option>
                  <option value="PIX">PIX</option>
                  <option value="CARD">Cartão</option>
                  <option value="BALANCE">Saldo</option>
                </select>
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
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Opcional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-0 min-w-0 space-y-4 overflow-y-auto border-t px-6 py-5 md:border-t-0 md:border-l">
            <div className="space-y-2">
              <Label>Itens da venda</Label>
              <Input
                placeholder="Buscar item por nome..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
              />
            </div>

            <div className="rounded-md border max-h-[52vh] overflow-y-auto">
              {isLoadingItems ? (
                <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando itens...
                </div>
              ) : !filteredItems.length ? (
                <p className="p-4 text-sm text-muted-foreground">Nenhum item encontrado</p>
              ) : (
                <div className="divide-y">
                  {filteredItems.map((item) => {
                    const quantity = quantities[item.id] ?? 0
                    const maxStock = item.totalStock
                    const isOutOfStock = maxStock !== null && maxStock <= 0
                    const reachedStockLimit = maxStock !== null && quantity >= maxStock

                    return (
                      <div key={item.id} className="p-4 flex items-center gap-4 justify-between">
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

            <div className="sticky bottom-0 z-10 rounded-md border bg-background p-4 shadow-sm space-y-2">
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

        <DialogFooter className="mt-0 border-t px-6 py-4">
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
