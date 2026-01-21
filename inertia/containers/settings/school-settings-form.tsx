import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Building2, MapPin, GraduationCap, Save, Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useSchool } from '../../hooks/queries/use-school'
import { useUpdateSchool } from '../../hooks/mutations/use-school-mutations'
import type { SharedProps } from '../../lib/types'

export function SchoolSettingsForm() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  if (!schoolId) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Escola não encontrada no contexto do usuário.
        </CardContent>
      </Card>
    )
  }

  return <SchoolSettingsFormContent schoolId={schoolId} />
}

function SchoolSettingsFormContent({ schoolId }: { schoolId: string }) {
  const { data: school } = useSchool(schoolId)
  const updateSchool = useUpdateSchool()

  const [formData, setFormData] = useState({
    name: school?.name || '',
    slug: school?.slug || '',
    street: school?.street || '',
    number: school?.number || '',
    complement: school?.complement || '',
    neighborhood: school?.neighborhood || '',
    city: school?.city || '',
    state: school?.state || '',
    zipCode: school?.zipCode || '',
    logoUrl: school?.logoUrl || '',
    minimumGrade: school?.minimumGrade ?? 6,
    calculationAlgorithm: school?.calculationAlgorithm || 'AVERAGE',
    minimumAttendancePercentage: school?.minimumAttendancePercentage ?? 75,
  })

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSchool.mutateAsync({
      id: schoolId,
      ...formData,
      street: formData.street || null,
      number: formData.number || null,
      complement: formData.complement || null,
      neighborhood: formData.neighborhood || null,
      city: formData.city || null,
      state: formData.state || null,
      zipCode: formData.zipCode || null,
      logoUrl: formData.logoUrl || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações Gerais
          </CardTitle>
          <CardDescription>Dados básicos da escola</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Escola</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              pattern="[a-z0-9-]+"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="logoUrl">URL do Logo</Label>
            <Input
              id="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
          <CardDescription>Localização da escola</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => handleChange('number', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              value={formData.complement}
              onChange={(e) => handleChange('complement', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              maxLength={2}
              placeholder="SP"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="00000-000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Configurações Acadêmicas
          </CardTitle>
          <CardDescription>Parâmetros de notas e frequência</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="minimumGrade">Nota Mínima para Aprovação</Label>
            <Input
              id="minimumGrade"
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={formData.minimumGrade}
              onChange={(e) => handleChange('minimumGrade', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calculationAlgorithm">Cálculo de Média</Label>
            <Select
              value={formData.calculationAlgorithm}
              onValueChange={(value) => handleChange('calculationAlgorithm', value)}
            >
              <SelectTrigger id="calculationAlgorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVERAGE">Média Aritmética</SelectItem>
                <SelectItem value="SUM">Soma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumAttendancePercentage">Frequência Mínima (%)</Label>
            <Input
              id="minimumAttendancePercentage"
              type="number"
              min={0}
              max={100}
              value={formData.minimumAttendancePercentage}
              onChange={(e) => handleChange('minimumAttendancePercentage', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={updateSchool.isPending}>
          {updateSchool.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
