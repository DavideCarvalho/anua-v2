import { useFormContext, useFieldArray } from 'react-hook-form'
import { Users, Plus, Trash2, Mail, Phone, FileText } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

import type { EnrollmentFormData } from './enrollment-form'

export function StepResponsibles() {
  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<EnrollmentFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'responsibles',
  })

  const isSelfResponsible = watch('student.isSelfResponsible')

  if (isSelfResponsible) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Responsáveis
          </CardTitle>
          <CardDescription>
            Como o aluno é maior de idade e será seu próprio responsável, esta etapa não é
            necessária.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O aluno será cadastrado como seu próprio responsável financeiro e pedagógico.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Responsáveis
        </CardTitle>
        <CardDescription>
          Adicione os responsáveis pelo aluno. É necessário pelo menos um responsável financeiro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Responsável {index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome completo *</Label>
                <Input
                  placeholder="Nome completo"
                  {...register(`responsibles.${index}.name`, { required: 'Nome é obrigatório' })}
                />
                {errors.responsibles?.[index]?.name && (
                  <p className="text-sm text-destructive">
                    {errors.responsibles[index]?.name?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>E-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    className="pl-10"
                    {...register(`responsibles.${index}.email`, {
                      required: 'E-mail é obrigatório',
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                    {...register(`responsibles.${index}.phone`, {
                      required: 'Telefone é obrigatório',
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input type="date" {...register(`responsibles.${index}.birthDate`)} />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Documento *</Label>
                <Select
                  defaultValue="CPF"
                  onValueChange={(value) =>
                    setValue(
                      `responsibles.${index}.documentType`,
                      value as 'CPF' | 'RG' | 'PASSPORT' | 'OTHER'
                    )
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
                <Label>Número do Documento *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="000.000.000-00"
                    className="pl-10"
                    {...register(`responsibles.${index}.document`, {
                      required: 'Documento é obrigatório',
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`responsibles.${index}.isPedagogical`}
                  checked={watch(`responsibles.${index}.isPedagogical`)}
                  onCheckedChange={(checked) =>
                    setValue(`responsibles.${index}.isPedagogical`, !!checked)
                  }
                />
                <Label htmlFor={`responsibles.${index}.isPedagogical`} className="text-sm">
                  Responsável Pedagógico
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`responsibles.${index}.isFinancial`}
                  checked={watch(`responsibles.${index}.isFinancial`)}
                  onCheckedChange={(checked) =>
                    setValue(`responsibles.${index}.isFinancial`, !!checked)
                  }
                />
                <Label htmlFor={`responsibles.${index}.isFinancial`} className="text-sm">
                  Responsável Financeiro
                </Label>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              name: '',
              email: '',
              phone: '',
              documentType: 'CPF',
              document: '',
              isPedagogical: false,
              isFinancial: false,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Responsável
        </Button>
      </CardContent>
    </Card>
  )
}
