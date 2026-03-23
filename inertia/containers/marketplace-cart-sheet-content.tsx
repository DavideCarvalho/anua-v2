import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { router } from '@inertiajs/react'
import { Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { differenceInMonths } from 'date-fns'
import { useCart } from '../contexts/cart-context'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import { Button } from '../components/ui/button'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Separator } from '../components/ui/separator'
import { SheetClose } from '../components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { formatCurrency } from '../lib/utils'

interface CartSheetContentProps {
  backHref?: string
  hasOnlinePayment?: boolean
  studentId?: string
  /** Responsável: só mensalidade (sem pagar agora / sem parcelar no gateway); parcelas na fatura respeitam regras da loja + período letivo */
  restrictCartPayment?: boolean
}

export function CartSheetContent({
  backHref = '/aluno/loja',
  hasOnlinePayment = false,
  studentId,
  restrictCartPayment = false,
}: CartSheetContentProps) {
  const cart = useCart()
  const [paymentOption, setPaymentOption] = useState<'IMMEDIATE' | 'BILL' | 'INSTALLMENTS'>('BILL')
  const [paymentMethod, setPaymentMethod] = useState<'BALANCE' | 'PIX'>('BALANCE')
  const [installments, setInstallments] = useState(2)
  const [billInstallments, setBillInstallments] = useState(1)
  const [notes, setNotes] = useState('')
  const queryClient = useQueryClient()
  const checkout = useMutation(api.api.v1.marketplace.checkout.mutationOptions())

  useEffect(() => {
    if (restrictCartPayment) {
      setPaymentOption('BILL')
    }
  }, [restrictCartPayment])

  const { data: installmentData } = useQuery({
    ...api.api.v1.marketplace.installmentOptions.queryOptions({
      query: { storeId: cart.storeId ?? '', amount: cart.totalPrice },
    }),
    enabled:
      !!cart.storeId &&
      cart.totalPrice > 0 &&
      (paymentOption === 'INSTALLMENTS' || paymentOption === 'BILL'),
  })
  const installmentOptions = installmentData?.options ?? []

  const { data: academicPeriodsData } = useQuery({
    ...api.api.v1.academicPeriods.listAcademicPeriods.queryOptions({
      query: { limit: 1 },
    }),
    enabled: paymentOption === 'BILL',
  })

  const maxBillInstallments = useMemo(() => {
    const activePeriod = academicPeriodsData?.data?.[0]
    let monthCap = 12
    if (activePeriod?.endDate) {
      const endDate = new Date(String(activePeriod.endDate))
      const now = new Date()
      monthCap = Math.max(1, differenceInMonths(endDate, now))
    }

    const rulesMax = installmentData?.maxInstallments ?? 1
    if (rulesMax > 1) {
      return Math.min(monthCap, rulesMax)
    }
    return monthCap
  }, [academicPeriodsData, installmentData])

  useEffect(() => {
    if (paymentOption !== 'BILL') return
    if (billInstallments > maxBillInstallments) {
      setBillInstallments(maxBillInstallments)
    }
  }, [paymentOption, billInstallments, maxBillInstallments])

  async function handleCheckout() {
    if (!cart.storeId) return
    const isDeferred = paymentOption === 'BILL' || paymentOption === 'INSTALLMENTS'
    const billParts = paymentOption === 'BILL' ? billInstallments : undefined
    try {
      await checkout.mutateAsync({
        body: {
          storeId: cart.storeId,
          items: cart.items.map((i) => ({ storeItemId: i.storeItemId, quantity: i.quantity })),
          paymentMode: isDeferred ? 'DEFERRED' : 'IMMEDIATE',
          paymentMethod: paymentOption === 'IMMEDIATE' ? paymentMethod : undefined,
          installments:
            paymentOption === 'INSTALLMENTS'
              ? installments
              : paymentOption === 'BILL'
                ? billParts
                : undefined,
          spreadAcrossPeriod: paymentOption === 'BILL' ? true : undefined,
          notes: notes || undefined,
          studentId,
        },
      })
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'orders'] })
      cart.clearCart()
      toast.success('Pedido realizado com sucesso!')
      router.visit(backHref)
    } catch {
      toast.error('Erro ao finalizar pedido')
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-0">
          {cart.items.map((item, index) => (
            <div key={item.storeItemId}>
              {index > 0 && <Separator className="my-3" />}
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} cada</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => cart.updateQuantity(item.storeItemId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => cart.updateQuantity(item.storeItemId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm font-medium w-20 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => cart.removeItem(item.storeItemId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Modo de pagamento</Label>
            {restrictCartPayment ? (
              <>
                {/* Pagar agora — desativado no fluxo responsável
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="IMMEDIATE" id="sheet-mode-immediate" />
                  <Label htmlFor="sheet-mode-immediate">Pagar agora</Label>
                </div>
                */}
                <p className="text-sm text-muted-foreground">
                  O valor será lançado na mensalidade do aluno (uma parcela por fatura). O limite de
                  parcelas é definido pela escola.
                </p>
              </>
            ) : (
              <RadioGroup
                value={paymentOption}
                onValueChange={(v) => setPaymentOption(v as 'IMMEDIATE' | 'BILL' | 'INSTALLMENTS')}
              >
                {hasOnlinePayment && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="IMMEDIATE" id="sheet-mode-immediate" />
                    <Label htmlFor="sheet-mode-immediate">Pagar agora</Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BILL" id="sheet-mode-bill" />
                  <Label htmlFor="sheet-mode-bill" className="flex flex-col">
                    <span>Adicionar na mensalidade</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Dividido nas próximas mensalidades
                    </span>
                  </Label>
                </div>
                {hasOnlinePayment && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INSTALLMENTS" id="sheet-mode-installments" />
                    <Label htmlFor="sheet-mode-installments">Parcelar</Label>
                  </div>
                )}
              </RadioGroup>
            )}
          </div>

          {paymentOption === 'BILL' && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium">Parcelas na mensalidade</Label>
                <Select
                  value={String(billInstallments)}
                  onValueChange={(v) => setBillInstallments(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxBillInstallments }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num}x de {formatCurrency(Math.ceil(cart.totalPrice / num))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {!restrictCartPayment && paymentOption === 'IMMEDIATE' && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium">Forma de pagamento</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as 'BALANCE' | 'PIX')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BALANCE" id="sheet-method-balance" />
                    <Label htmlFor="sheet-method-balance">Saldo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PIX" id="sheet-method-pix" />
                    <Label htmlFor="sheet-method-pix">PIX</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {!restrictCartPayment && paymentOption === 'INSTALLMENTS' && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium">Parcelas</Label>
                {installmentOptions.length > 0 ? (
                  <RadioGroup
                    value={String(installments)}
                    onValueChange={(v) => setInstallments(Number(v))}
                  >
                    {installmentOptions.map((option) => (
                      <div key={option.installments} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={String(option.installments)}
                          id={`sheet-installment-${option.installments}`}
                        />
                        <Label htmlFor={`sheet-installment-${option.installments}`}>
                          {option.installments}x de {formatCurrency(option.installmentAmount)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Carregando opcoes de parcelamento...
                  </p>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="sheet-notes" className="text-sm font-medium">
              Observações
            </Label>
            <Textarea
              id="sheet-notes"
              placeholder="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="border-t px-6 py-4 space-y-3">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(cart.totalPrice)}</span>
        </div>
        <SheetClose>
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={checkout.isPending}
          >
            {checkout.isPending ? 'Finalizando...' : 'Finalizar Compra'}
          </Button>
        </SheetClose>
      </div>
    </div>
  )
}
