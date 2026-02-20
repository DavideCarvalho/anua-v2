import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Calendar, Percent, DollarSign, Plus, Trash2, AlertCircle } from 'lucide-react'

import { useContractPaymentDaysQueryOptions } from '../../hooks/queries/use_contract_payment_days'
import { useContractInterestConfigQueryOptions } from '../../hooks/queries/use_contract_interest_config'
import { useContractEarlyDiscountsQueryOptions } from '../../hooks/queries/use_contract_early_discounts'
import {
  removeContractPaymentDayMutationOptions,
  removeContractEarlyDiscountMutationOptions,
} from '../../hooks/mutations/use_contract_financial_mutations'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'

interface ContractFinancialConfigProps {
  contractId: string
}

export function ContractFinancialConfig({ contractId }: ContractFinancialConfigProps) {
  const queryClient = useQueryClient()
  const { data: paymentDaysData } = useSuspenseQuery(useContractPaymentDaysQueryOptions(contractId))
  const { data: interestData } = useSuspenseQuery(useContractInterestConfigQueryOptions(contractId))
  const { data: discountsData } = useSuspenseQuery(
    useContractEarlyDiscountsQueryOptions(contractId)
  )

  const removePaymentDay = useMutation(removeContractPaymentDayMutationOptions())
  const removeDiscount = useMutation(removeContractEarlyDiscountMutationOptions())

  const paymentDays = paymentDaysData ?? []
  const interestConfig = interestData && typeof interestData === 'object' ? interestData : null
  const discounts = discountsData ?? []

  const handleRemovePaymentDay = async (id: string) => {
    try {
      await removePaymentDay.mutateAsync({ contractId, id })
      await queryClient.invalidateQueries({ queryKey: ['contract-payment-days', contractId] })
      await queryClient.invalidateQueries({ queryKey: ['contract', contractId] })
    } catch {
      toast.error('Erro ao remover dia de pagamento')
    }
  }

  const handleRemoveDiscount = async (id: string) => {
    try {
      await removeDiscount.mutateAsync({ contractId, id })
      await queryClient.invalidateQueries({ queryKey: ['contract-early-discounts', contractId] })
      await queryClient.invalidateQueries({ queryKey: ['contract', contractId] })
    } catch {
      toast.error('Erro ao remover desconto')
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Days */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dias de Pagamento
            </CardTitle>
            <CardDescription>Configure os dias do mês em que as parcelas vencem</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {paymentDays.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {paymentDays.map((day: any) => (
                <Badge key={day.id} variant="secondary" className="gap-2 px-3 py-1 text-sm">
                  Dia {day.day}
                  <button
                    onClick={() => {
                      handleRemovePaymentDay(day.id)
                    }}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum dia de pagamento configurado</p>
          )}
        </CardContent>
      </Card>

      {/* Interest Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Configuração de Juros
          </CardTitle>
          <CardDescription>Configure juros e multas para pagamentos em atraso</CardDescription>
        </CardHeader>
        <CardContent>
          {interestConfig ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Taxa de Juros (% ao mês)</p>
                <p className="text-2xl font-bold">{(interestConfig as any).interestRate || 0}%</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Multa por Atraso (%)</p>
                <p className="text-2xl font-bold">
                  {(interestConfig as any).lateFeePercentage || 0}%
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Dias de Carência</p>
                <p className="text-2xl font-bold">{(interestConfig as any).gracePeriodDays || 0}</p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configuração de juros não definida para este contrato
              </AlertDescription>
            </Alert>
          )}
          <div className="mt-4">
            <Button variant="outline" size="sm">
              Editar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Early Discounts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Descontos por Antecipação
            </CardTitle>
            <CardDescription>Configure descontos para pagamentos antecipados</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {discounts.length > 0 ? (
            <div className="space-y-2">
              {discounts.map((discount: any) => (
                <div
                  key={discount.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {discount.discountPercentage || discount.percentage}% OFF
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Pagamento até {discount.daysBeforeDue || discount.days} dias antes do
                      vencimento
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleRemoveDiscount(discount.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum desconto por antecipação configurado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
