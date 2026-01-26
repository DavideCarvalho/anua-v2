import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { FileText } from 'lucide-react'

interface ContractDetailsCardProps {
  name: string
  enrollmentValue: number | null
  monthlyFee: number
  installments: number
  enrollmentInstallments: number
  paymentType: 'MONTHLY' | 'UPFRONT'
}

const PaymentTypeLabels = {
  MONTHLY: 'Mensal',
  UPFRONT: 'À Vista',
}

function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100)
}

export function ContractDetailsCard({
  name,
  enrollmentValue,
  monthlyFee,
  installments,
  enrollmentInstallments,
  paymentType,
}: ContractDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Contrato: {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {enrollmentValue !== null && enrollmentValue > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Matrícula</p>
              <p className="font-medium">{formatCurrency(enrollmentValue)}</p>
              <p className="text-xs text-muted-foreground">{enrollmentInstallments}x</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Mensalidade</p>
            <p className="font-medium">{formatCurrency(monthlyFee)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Parcelas</p>
            <p className="font-medium">{installments}x</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p className="font-medium">{PaymentTypeLabels[paymentType]}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
