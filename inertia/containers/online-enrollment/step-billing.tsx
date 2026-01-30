import { useFormContext } from 'react-hook-form'
import { useState } from 'react'
import { CreditCard, FileText, Tag, Check, AlertCircle } from 'lucide-react'

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
import { Alert, AlertDescription } from '../../components/ui/alert'

import type { EnrollmentFormData } from './enrollment-form'
import { useFindScholarshipMutation } from '../../hooks/mutations/use_find_scholarship'

interface StepBillingProps {
  schoolId: string
  contract: {
    enrollmentValue: number
    amount: number
    paymentType: string
    enrollmentValueInstallments: number
    installments: number
  } | null
}

export function StepBilling({ schoolId, contract }: StepBillingProps) {
  const {
    setValue,
    watch,
  } = useFormContext<EnrollmentFormData>()

  const [scholarshipCode, setScholarshipCode] = useState('')
  const [appliedScholarship, setAppliedScholarship] = useState<{
    name: string
    discountPercentage: number
    enrollmentDiscountPercentage: number
  } | null>(null)

  const findScholarshipMutation = useFindScholarshipMutation()

  const paymentMethod = watch('billing.paymentMethod')

  const handleApplyScholarship = async () => {
    if (!scholarshipCode) return

    try {
      const result = await findScholarshipMutation.mutateAsync({
        code: scholarshipCode,
        schoolId,
      })

      setAppliedScholarship({
        name: result.name,
        discountPercentage: result.discountPercentage,
        enrollmentDiscountPercentage: result.enrollmentDiscountPercentage,
      })
      setValue('billing.scholarshipCode', scholarshipCode)
    } catch (error) {
      setAppliedScholarship(null)
      setValue('billing.scholarshipCode', undefined)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  const calculateDiscountedValue = (value: number, discountPercentage: number) => {
    return value - value * (discountPercentage / 100)
  }

  return (
    <div className="space-y-6">
      {/* Contract Summary */}
      {contract && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumo do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Taxa de Matrícula</p>
                <p className="text-2xl font-bold">
                  {appliedScholarship
                    ? formatCurrency(
                        calculateDiscountedValue(
                          contract.enrollmentValue,
                          appliedScholarship.enrollmentDiscountPercentage
                        )
                      )
                    : formatCurrency(contract.enrollmentValue)}
                </p>
                {appliedScholarship && appliedScholarship.enrollmentDiscountPercentage > 0 && (
                  <p className="text-xs text-green-600">
                    {appliedScholarship.enrollmentDiscountPercentage}% de desconto aplicado
                  </p>
                )}
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Mensalidade</p>
                <p className="text-2xl font-bold">
                  {appliedScholarship
                    ? formatCurrency(
                        calculateDiscountedValue(
                          contract.amount,
                          appliedScholarship.discountPercentage
                        )
                      )
                    : formatCurrency(contract.amount)}
                </p>
                {appliedScholarship && appliedScholarship.discountPercentage > 0 && (
                  <p className="text-xs text-green-600">
                    {appliedScholarship.discountPercentage}% de desconto aplicado
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scholarship Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Código de Bolsa
          </CardTitle>
          <CardDescription>
            Se você possui um código de bolsa ou desconto, insira-o abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código da bolsa"
              value={scholarshipCode}
              onChange={(e) => setScholarshipCode(e.target.value.toUpperCase())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyScholarship}
              disabled={!scholarshipCode || findScholarshipMutation.isPending}
            >
              Aplicar
            </Button>
          </div>

          {appliedScholarship && (
            <Alert className="mt-4 border-green-500">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Bolsa "{appliedScholarship.name}" aplicada com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {findScholarshipMutation.isError && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Código de bolsa inválido ou não encontrado.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Forma de Pagamento
          </CardTitle>
          <CardDescription>Escolha como deseja realizar os pagamentos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) =>
              setValue('billing.paymentMethod', value as 'BOLETO' | 'CREDIT_CARD' | 'PIX')
            }
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
              <RadioGroupItem value="BOLETO" id="boleto" />
              <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                <span className="font-medium">Boleto Bancário</span>
                <p className="text-sm text-muted-foreground">
                  Pagamento via boleto com vencimento mensal
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
              <RadioGroupItem value="PIX" id="pix" />
              <Label htmlFor="pix" className="flex-1 cursor-pointer">
                <span className="font-medium">PIX</span>
                <p className="text-sm text-muted-foreground">
                  Pagamento instantâneo via PIX
                </p>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
              <RadioGroupItem value="CREDIT_CARD" id="credit_card" />
              <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                <span className="font-medium">Cartão de Crédito</span>
                <p className="text-sm text-muted-foreground">
                  Débito automático no cartão de crédito
                </p>
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === 'BOLETO' && (
            <div className="space-y-2">
              <Label>Dia de vencimento do boleto</Label>
              <Select
                value={String(watch('billing.paymentDay') || '')}
                onValueChange={(value) => setValue('billing.paymentDay', Number(value))}
              >
                <SelectTrigger className="w-48">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Parcelas da matrícula</Label>
              <Select
                value={String(watch('billing.enrollmentInstallments') || 1)}
                onValueChange={(value) => setValue('billing.enrollmentInstallments', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}x {contract && formatCurrency(contract.enrollmentValue / n)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parcelas da mensalidade</Label>
              <Select
                value={String(watch('billing.installments') || 12)}
                onValueChange={(value) => setValue('billing.installments', Number(value))}
              >
                <SelectTrigger>
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
