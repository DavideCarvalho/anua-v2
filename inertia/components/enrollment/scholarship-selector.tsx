import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { GraduationCap } from 'lucide-react'

type DiscountType = 'PERCENTAGE' | 'FLAT'

interface Scholarship {
  id: string
  name: string
  discountPercentage: number
  enrollmentDiscountPercentage: number
  discountValue: number | null
  enrollmentDiscountValue: number | null
  discountType: DiscountType
  type: string
}

interface ScholarshipSelectorProps {
  scholarships: Scholarship[]
  value: string | null
  onChange: (scholarshipId: string | null, scholarship: Scholarship | null) => void
  disabled?: boolean
  isLoading?: boolean
}

export function ScholarshipSelector({
  scholarships,
  value,
  onChange,
  disabled,
  isLoading,
}: ScholarshipSelectorProps) {
  const handleChange = (selectedValue: string) => {
    if (selectedValue === 'none') {
      onChange(null, null)
    } else {
      const scholarship = scholarships.find((s) => s.id === selectedValue)
      onChange(selectedValue, scholarship || null)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4" />
        Aplicar Bolsa (opcional)
      </Label>
      <Select value={value || 'none'} onValueChange={handleChange} disabled={disabled || isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? 'Carregando bolsas...' : 'Selecione uma bolsa'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem bolsa</SelectItem>
          {scholarships.map((scholarship) => {
            const isFlat = scholarship.discountType === 'FLAT'
            const monthlyDiscount =
              isFlat && scholarship.discountValue
                ? `R$ ${(scholarship.discountValue / 100).toFixed(2).replace('.', ',')}`
                : `${scholarship.discountPercentage}%`
            const enrollmentDiscount =
              isFlat && scholarship.enrollmentDiscountValue
                ? `R$ ${(scholarship.enrollmentDiscountValue / 100).toFixed(2).replace('.', ',')}`
                : `${scholarship.enrollmentDiscountPercentage}%`

            return (
              <SelectItem key={scholarship.id} value={scholarship.id}>
                {scholarship.name} ({monthlyDiscount} mensalidade
                {scholarship.enrollmentDiscountPercentage > 0 || scholarship.enrollmentDiscountValue
                  ? `, ${enrollmentDiscount} matrícula`
                  : ''}
                )
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
