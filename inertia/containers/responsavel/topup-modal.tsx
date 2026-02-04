import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Card, CardContent } from '../../components/ui/card'
import { CurrencyInput } from '../../components/ui/currency-input'
import { formatCurrency } from '../../lib/utils'
import { useCreateWalletTopUp } from '../../hooks/mutations/use_wallet_topup_mutations'
import { Loader2, QrCode, Copy, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface TopUpModalProps {
  studentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PaymentResult {
  pixQrCodeImage?: string
  pixCopyPaste?: string
  bankSlipUrl?: string
  invoiceUrl?: string
}

export function TopUpModal({ studentId, open, onOpenChange }: TopUpModalProps) {
  const [amount, setAmount] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'BOLETO'>('PIX')
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [copied, setCopied] = useState(false)

  const createTopUp = useCreateWalletTopUp()

  const amountInCents = Math.round(parseFloat(amount) * 100)
  const isValidAmount = amountInCents >= 100

  function resetState() {
    setAmount('0')
    setPaymentMethod('PIX')
    setPaymentResult(null)
    setCopied(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      resetState()
    }
    onOpenChange(open)
  }

  async function handleSubmit() {
    if (!isValidAmount) {
      toast.error('O valor mínimo é R$ 1,00')
      return
    }

    try {
      const result = await createTopUp.mutateAsync({
        studentId,
        amount: amountInCents,
        paymentMethod,
      })
      const response = result as { paymentDetails: PaymentResult }
      setPaymentResult(response.paymentDetails)
    } catch {
      toast.error('Erro ao criar recarga. Tente novamente.')
    }
  }

  async function handleCopyPix() {
    if (!paymentResult?.pixCopyPaste) return
    try {
      await navigator.clipboard.writeText(paymentResult.pixCopyPaste)
      setCopied(true)
      toast.success('Código PIX copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Erro ao copiar código PIX')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paymentResult ? 'Pagamento gerado' : 'Recarregar saldo'}
          </DialogTitle>
        </DialogHeader>

        {!paymentResult ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Valor da recarga</Label>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                placeholder="0,00"
              />
              {parseFloat(amount) > 0 && !isValidAmount && (
                <p className="text-xs text-destructive">Valor mínimo: R$ 1,00</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as 'PIX' | 'BOLETO')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PIX" id="pix" />
                  <Label htmlFor="pix" className="cursor-pointer">
                    PIX
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BOLETO" id="boleto" />
                  <Label htmlFor="boleto" className="cursor-pointer">
                    Boleto
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {isValidAmount && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="font-medium">{formatCurrency(amountInCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Pagamento</span>
                    <span className="font-medium">
                      {paymentMethod === 'PIX' ? 'PIX' : 'Boleto'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!isValidAmount || createTopUp.isPending}
                onClick={handleSubmit}
              >
                {createTopUp.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Confirmar recarga'
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethod === 'PIX' && paymentResult.pixQrCodeImage ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4" />
                  <span>Escaneie o QR Code para pagar</span>
                </div>
                <img
                  src={`data:image/png;base64,${paymentResult.pixQrCodeImage}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 border rounded-lg"
                />
                {paymentResult.pixCopyPaste && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCopyPix}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar código PIX
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Seu boleto foi gerado com sucesso. Clique abaixo para visualizar.
                </p>
                {paymentResult.bankSlipUrl && (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => window.open(paymentResult.bankSlipUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Abrir Boleto
                  </Button>
                )}
                {paymentResult.invoiceUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(paymentResult.invoiceUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver Fatura
                  </Button>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOpenChange(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
