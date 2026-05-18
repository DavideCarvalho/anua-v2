import { useFormContext } from 'react-hook-form'
import { useState } from 'react'
import { CreditCard, Tag, Check, AlertCircle, Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { cn } from '../../lib/utils'

import type { EnrollmentFormData } from './enrollment-form'
import type { Route } from '@tuyau/core/types'
import { useMutation } from '@tanstack/react-query'
import { api } from '~/lib/api'

type EnrollmentInfoContract = Route.Response<'api.v1.enrollment.info'>['contract']

interface StepBillingProps {
  schoolId: string
  contract: EnrollmentInfoContract
}

type PaymentMethod = 'BOLETO' | 'CREDIT_CARD' | 'PIX'

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; description: string }> = [
  { value: 'BOLETO', label: 'Boleto Bancário', description: 'Vencimento mensal' },
  { value: 'PIX', label: 'PIX', description: 'Pagamento instantâneo' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito', description: 'Débito automático' },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100)
}

function applyDiscount(value: number, pct: number) {
  return value - value * (pct / 100)
}

export function StepBilling({ schoolId, contract }: StepBillingProps) {
  const { setValue, watch } = useFormContext<EnrollmentFormData>()

  const [scholarshipCode, setScholarshipCode] = useState('')
  const [appliedScholarship, setAppliedScholarship] = useState<{
    name: string
    discountPercentage: number
    enrollmentDiscountPercentage: number
  } | null>(null)
  const [scholarshipError, setScholarshipError] = useState<string | null>(null)

  const findScholarshipMutation = useMutation(
    api.api.v1.enrollment.findScholarship.mutationOptions()
  )

  const paymentMethod = watch('billing.paymentMethod') as PaymentMethod
  const enrollmentValue = contract?.enrollmentValue ?? 0
  const monthlyValue = contract?.amount ?? 0

  const enrollmentFinal = appliedScholarship
    ? applyDiscount(enrollmentValue, appliedScholarship.enrollmentDiscountPercentage)
    : enrollmentValue
  const monthlyFinal = appliedScholarship
    ? applyDiscount(monthlyValue, appliedScholarship.discountPercentage)
    : monthlyValue

  const handleApplyScholarship = async () => {
    if (!scholarshipCode) return
    setScholarshipError(null)
    try {
      const result = await findScholarshipMutation.mutateAsync({
        body: { code: scholarshipCode, schoolId },
      })
      setAppliedScholarship({
        name: result.name,
        discountPercentage: result.discountPercentage,
        enrollmentDiscountPercentage: result.enrollmentDiscountPercentage,
      })
      setValue('billing.scholarshipCode', scholarshipCode)
    } catch {
      setAppliedScholarship(null)
      setValue('billing.scholarshipCode', undefined)
      setScholarshipError('Código não encontrado ou inválido')
    }
  }

  const handleRemoveScholarship = () => {
    setAppliedScholarship(null)
    setScholarshipCode('')
    setValue('billing.scholarshipCode', undefined)
  }

  return (
    <div className="space-y-6">
      {/* Card único: Resumo + Bolsa.
          Antes eram 2 cards empilhados, virou seção interna separada por
          border-t pra não nestar cards e respeitar DESIGN.md. */}
      {contract && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo do contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-0.5">
                <dt className="text-xs text-muted-foreground">Taxa de matrícula</dt>
                <dd className="text-xl font-semibold tabular-nums text-primary">
                  {formatCurrency(enrollmentFinal)}
                </dd>
                {appliedScholarship && appliedScholarship.enrollmentDiscountPercentage > 0 && (
                  <p className="text-xs text-muted-foreground line-through tabular-nums">
                    {formatCurrency(enrollmentValue)}
                  </p>
                )}
              </div>
              <div className="space-y-0.5">
                <dt className="text-xs text-muted-foreground">Mensalidade</dt>
                <dd className="text-xl font-semibold tabular-nums">
                  {formatCurrency(monthlyFinal)}
                </dd>
                {appliedScholarship && appliedScholarship.discountPercentage > 0 && (
                  <p className="text-xs text-muted-foreground line-through tabular-nums">
                    {formatCurrency(monthlyValue)}
                  </p>
                )}
              </div>
            </dl>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <Label htmlFor="scholarship-code" className="text-sm">
                  Código de bolsa ou desconto
                </Label>
              </div>
              {appliedScholarship ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="truncate">
                      <span className="font-medium">{appliedScholarship.name}</span> aplicado
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveScholarship}
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline shrink-0"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="scholarship-code"
                    placeholder="Digite o código"
                    value={scholarshipCode}
                    onChange={(e) => {
                      setScholarshipCode(e.target.value.toUpperCase())
                      setScholarshipError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleApplyScholarship()
                      }
                    }}
                    aria-invalid={!!scholarshipError}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyScholarship}
                    disabled={!scholarshipCode || findScholarshipMutation.isPending}
                  >
                    {findScholarshipMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Aplicar'
                    )}
                  </Button>
                </div>
              )}
              {scholarshipError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {scholarshipError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forma de pagamento em lista compacta (era kit-card largo, virou
          padrão Linear: linha por opção separada por border-b). */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Forma de pagamento
          </CardTitle>
          <CardDescription>Como você prefere pagar as mensalidades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setValue('billing.paymentMethod', value as PaymentMethod)}
            className="divide-y divide-border"
          >
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method.value
              return (
                <Label
                  key={method.value}
                  htmlFor={method.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 py-2.5 transition-colors',
                    'hover:text-foreground',
                    !selected && 'text-muted-foreground'
                  )}
                >
                  <RadioGroupItem value={method.value} id={method.value} />
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{method.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{method.description}</span>
                  </span>
                </Label>
              )
            })}
          </RadioGroup>

          {paymentMethod === 'BOLETO' && (
            <div className="space-y-1.5">
              <Label htmlFor="payment-day" className="text-sm">
                Dia de vencimento
              </Label>
              <Select
                value={String(watch('billing.paymentDay') || '')}
                onValueChange={(value) => setValue('billing.paymentDay', Number(value))}
              >
                <SelectTrigger id="payment-day" className="w-48">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 25].map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      Dia {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="enrollment-installments" className="text-sm">
                Parcelas da matrícula
              </Label>
              <Select
                value={String(watch('billing.enrollmentInstallments') || 1)}
                onValueChange={(value) => setValue('billing.enrollmentInstallments', Number(value))}
              >
                <SelectTrigger id="enrollment-installments">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}x {formatCurrency(enrollmentFinal / n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="monthly-installments" className="text-sm">
                Parcelas da mensalidade
              </Label>
              <Select
                value={String(watch('billing.installments') || 12)}
                onValueChange={(value) => setValue('billing.installments', Number(value))}
              >
                <SelectTrigger id="monthly-installments">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 11, 12].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} mensalidades
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
