import { useFormContext } from 'react-hook-form'
import { User, Mail, Phone, Calendar, FileText } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

import type { EnrollmentFormData } from './enrollment-form'

export function StepStudentInfo() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<EnrollmentFormData>()

  const isSelfResponsible = watch('student.isSelfResponsible')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados do Aluno
        </CardTitle>
        <CardDescription>Preencha as informações do aluno que será matriculado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="student.name">Nome completo *</Label>
            <Input
              id="student.name"
              placeholder="Nome completo do aluno"
              {...register('student.name', { required: 'Nome é obrigatório' })}
            />
            {errors.student?.name && (
              <p className="text-sm text-destructive">{errors.student.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="student.email">E-mail *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="student.email"
                type="email"
                placeholder="email@exemplo.com"
                className="pl-10"
                {...register('student.email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'E-mail inválido',
                  },
                })}
              />
            </div>
            {errors.student?.email && (
              <p className="text-sm text-destructive">{errors.student.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="student.phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="student.phone"
                placeholder="(11) 99999-9999"
                className="pl-10"
                {...register('student.phone')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student.birthDate">Data de Nascimento *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="student.birthDate"
                type="date"
                className="pl-10"
                {...register('student.birthDate', { required: 'Data de nascimento é obrigatória' })}
              />
            </div>
            {errors.student?.birthDate && (
              <p className="text-sm text-destructive">{errors.student.birthDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="student.documentType">Tipo de Documento *</Label>
            <Select
              defaultValue="CPF"
              onValueChange={(value) =>
                setValue('student.documentType', value as 'CPF' | 'RG' | 'PASSPORT' | 'OTHER')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="RG">RG</SelectItem>
                <SelectItem value="PASSPORT">Passaporte</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student.document">Número do Documento *</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="student.document"
                placeholder="000.000.000-00"
                className="pl-10"
                {...register('student.document', { required: 'Documento é obrigatório' })}
              />
            </div>
            {errors.student?.document && (
              <p className="text-sm text-destructive">{errors.student.document.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4 border-t">
          <Checkbox
            id="student.isSelfResponsible"
            checked={isSelfResponsible}
            onCheckedChange={(checked) => setValue('student.isSelfResponsible', !!checked)}
          />
          <Label htmlFor="student.isSelfResponsible" className="text-sm font-normal">
            O aluno é maior de idade e será seu próprio responsável
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
