import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { GraduationCap } from 'lucide-react'

interface Scholarship {
  id: string
  name: string
  discountPercentage: number
  enrollmentDiscountPercentage: number
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
      <Select
        value={value || 'none'}
        onValueChange={handleChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={isLoading ? 'Carregando bolsas...' : 'Selecione uma bolsa'}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem bolsa</SelectItem>
          {scholarships.map((scholarship) => (
            <SelectItem key={scholarship.id} value={scholarship.id}>
              {scholarship.name} ({scholarship.discountPercentage}% mensalidade
              {scholarship.enrollmentDiscountPercentage > 0 &&
                `, ${scholarship.enrollmentDiscountPercentage}% matrícula`}
              )
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
