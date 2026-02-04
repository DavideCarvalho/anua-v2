import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { router } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '../contexts/cart-context'
import { useInstallmentOptionsQueryOptions } from '../hooks/queries/use_marketplace'
import { useMarketplaceCheckout } from '../hooks/mutations/use_marketplace_mutations'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Separator } from '../components/ui/separator'
import { formatCurrency } from '../lib/utils'

export function MarketplaceCartContainer() {
  const cart = useCart()
  const [paymentMode, setPaymentMode] = useState<'IMMEDIATE' | 'DEFERRED'>('IMMEDIATE')
  const [paymentMethod, setPaymentMethod] = useState<'BALANCE' | 'PIX'>('BALANCE')
  const [installments, setInstallments] = useState(1)
  const [notes, setNotes] = useState('')
  const checkout = useMarketplaceCheckout()

  const { data: installmentData } = useQuery({
    ...useInstallmentOptionsQueryOptions(cart.storeId ?? '', cart.totalPrice),
    enabled: paymentMode === 'DEFERRED' && !!cart.storeId && cart.totalPrice > 0,
  })
  const installmentOptions = (installmentData as any)?.options ?? []

  function handleCheckout() {
    if (!cart.storeId) return
    checkout.mutate(
      {
        storeId: cart.storeId,
        items: cart.items.map((i) => ({ storeItemId: i.storeItemId, quantity: i.quantity })),
        paymentMode,
        paymentMethod: paymentMode === 'IMMEDIATE' ? paymentMethod : undefined,
        installments: paymentMode === 'DEFERRED' ? installments : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          cart.clearCart()
          toast.success('Pedido realizado com sucesso!')
          router.visit('/aluno/loja/pedidos')
        },
        onError: (error: any) => {
          toast.error(error?.message ?? 'Erro ao finalizar pedido')
        },
      }
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Seu carrinho está vazio</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione itens de uma loja para começar
        </p>
        <Link route={'web.aluno.loja' as any}>
          <Button variant="outline" className="mt-4">
            Explorar lojas
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cart items */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Itens do carrinho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {cart.items.map((item, index) => (
              <div key={item.storeItemId}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} cada
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => cart.updateQuantity(item.storeItemId, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => cart.updateQuantity(item.storeItemId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium w-24 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => cart.removeItem(item.storeItemId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(cart.totalPrice)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout form */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Modo de pagamento</Label>
              <RadioGroup
                value={paymentMode}
                onValueChange={(v) => setPaymentMode(v as 'IMMEDIATE' | 'DEFERRED')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="IMMEDIATE" id="mode-immediate" />
                  <Label htmlFor="mode-immediate">Pagar agora</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DEFERRED" id="mode-deferred" />
                  <Label htmlFor="mode-deferred">Parcelar</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Immediate: payment method */}
            {paymentMode === 'IMMEDIATE' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Forma de pagamento</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as 'BALANCE' | 'PIX')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BALANCE" id="method-balance" />
                    <Label htmlFor="method-balance">Saldo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PIX" id="method-pix" />
                    <Label htmlFor="method-pix">PIX</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Deferred: installment options */}
            {paymentMode === 'DEFERRED' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Parcelas</Label>
                {installmentOptions.length > 0 ? (
                  <RadioGroup
                    value={String(installments)}
                    onValueChange={(v) => setInstallments(Number(v))}
                  >
                    {installmentOptions.map((option: any) => (
                      <div key={option.installments} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={String(option.installments)}
                          id={`installment-${option.installments}`}
                        />
                        <Label htmlFor={`installment-${option.installments}`}>
                          {option.installments}x de {formatCurrency(option.installmentAmount)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Carregando opções de parcelamento...
                  </p>
                )}
              </div>
            )}

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Observações
              </Label>
              <Textarea
                id="notes"
                placeholder="Observações (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? 'Finalizando...' : 'Finalizar Compra'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
