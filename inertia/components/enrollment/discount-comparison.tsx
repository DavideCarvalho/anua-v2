import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { TrendingDown } from 'lucide-react'

interface DiscountComparisonProps {
  originalEnrollmentFee: number
  originalMonthlyFee: number
  enrollmentDiscountPercentage: number
  monthlyDiscountPercentage: number
  installments: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function DiscountComparison({
  originalEnrollmentFee,
  originalMonthlyFee,
  enrollmentDiscountPercentage,
  monthlyDiscountPercentage,
  installments,
}: DiscountComparisonProps) {
  const discountedEnrollmentFee =
    originalEnrollmentFee * (1 - enrollmentDiscountPercentage / 100)
  const discountedMonthlyFee = originalMonthlyFee * (1 - monthlyDiscountPercentage / 100)

  const enrollmentSavings = originalEnrollmentFee - discountedEnrollmentFee
  const monthlySavings = (originalMonthlyFee - discountedMonthlyFee) * installments
  const totalSavings = enrollmentSavings + monthlySavings

  const hasEnrollmentDiscount = enrollmentDiscountPercentage > 0 && originalEnrollmentFee > 0
  const hasMonthlyDiscount = monthlyDiscountPercentage > 0

  if (!hasEnrollmentDiscount && !hasMonthlyDiscount) {
    return null
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-green-700">
          <TrendingDown className="h-4 w-4" />
          Comparativo de Desconto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
          <span>Item</span>
          <span>Original</span>
          <span>Desconto</span>
          <span>Final</span>
        </div>

        {hasEnrollmentDiscount && (
          <div className="grid grid-cols-4 gap-2 text-sm">
            <span>Matrícula</span>
            <span className="line-through text-muted-foreground">
              {formatCurrency(originalEnrollmentFee)}
            </span>
            <span className="text-green-600">{enrollmentDiscountPercentage}%</span>
            <span className="font-medium">{formatCurrency(discountedEnrollmentFee)}</span>
          </div>
        )}

        {hasMonthlyDiscount && (
          <div className="grid grid-cols-4 gap-2 text-sm">
            <span>Mensalidade</span>
            <span className="line-through text-muted-foreground">
              {formatCurrency(originalMonthlyFee)}
            </span>
            <span className="text-green-600">{monthlyDiscountPercentage}%</span>
            <span className="font-medium">{formatCurrency(discountedMonthlyFee)}</span>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-sm font-medium text-green-700">
            Economia total: {formatCurrency(totalSavings)}/ano
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
