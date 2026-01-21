import { useFormContext } from 'react-hook-form'
import { MapPin } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

import type { EnrollmentFormData } from './enrollment-form'

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

export function StepAddress() {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<EnrollmentFormData>()

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setValue('address.street', data.logradouro || '')
        setValue('address.neighborhood', data.bairro || '')
        setValue('address.city', data.localidade || '')
        setValue('address.state', data.uf || '')
      }
    } catch (error) {
      console.error('Error fetching CEP:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Endereço
        </CardTitle>
        <CardDescription>Informe o endereço de residência do aluno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address.zipCode">CEP *</Label>
            <Input
              id="address.zipCode"
              placeholder="00000-000"
              {...register('address.zipCode', { required: 'CEP é obrigatório' })}
              onBlur={(e) => handleCepBlur(e.target.value)}
            />
            {errors.address?.zipCode && (
              <p className="text-sm text-destructive">{errors.address.zipCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.state">Estado *</Label>
            <Select value={watch('address.state')} onValueChange={(value) => setValue('address.state', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.address?.state && (
              <p className="text-sm text-destructive">{errors.address.state.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address.street">Rua/Logradouro *</Label>
            <Input
              id="address.street"
              placeholder="Nome da rua"
              {...register('address.street', { required: 'Rua é obrigatória' })}
            />
            {errors.address?.street && (
              <p className="text-sm text-destructive">{errors.address.street.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.number">Número *</Label>
            <Input
              id="address.number"
              placeholder="123"
              {...register('address.number', { required: 'Número é obrigatório' })}
            />
            {errors.address?.number && (
              <p className="text-sm text-destructive">{errors.address.number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.complement">Complemento</Label>
            <Input
              id="address.complement"
              placeholder="Apto, Bloco, etc."
              {...register('address.complement')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.neighborhood">Bairro *</Label>
            <Input
              id="address.neighborhood"
              placeholder="Nome do bairro"
              {...register('address.neighborhood', { required: 'Bairro é obrigatório' })}
            />
            {errors.address?.neighborhood && (
              <p className="text-sm text-destructive">{errors.address.neighborhood.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.city">Cidade *</Label>
            <Input
              id="address.city"
              placeholder="Nome da cidade"
              {...register('address.city', { required: 'Cidade é obrigatória' })}
            />
            {errors.address?.city && (
              <p className="text-sm text-destructive">{errors.address.city.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
