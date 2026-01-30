import { useFormContext, useFieldArray } from 'react-hook-form'
import { Heart, Plus, Trash2, Phone, Users } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

import type { EnrollmentFormData } from './enrollment-form'

const RELATIONSHIPS = [
  { value: 'MOTHER', label: 'Mãe' },
  { value: 'FATHER', label: 'Pai' },
  { value: 'GRANDMOTHER', label: 'Avó' },
  { value: 'GRANDFATHER', label: 'Avô' },
  { value: 'AUNT', label: 'Tia' },
  { value: 'UNCLE', label: 'Tio' },
  { value: 'COUSIN', label: 'Primo(a)' },
  { value: 'NEPHEW', label: 'Sobrinho' },
  { value: 'NIECE', label: 'Sobrinha' },
  { value: 'GUARDIAN', label: 'Responsável Legal' },
  { value: 'OTHER', label: 'Outro' },
]

export function StepMedicalInfo() {
  const {
    register,
    control,
    setValue,
    watch,
  } = useFormContext<EnrollmentFormData>()

  const {
    fields: medicationFields,
    append: appendMedication,
    remove: removeMedication,
  } = useFieldArray({
    control,
    name: 'medicalInfo.medications',
  })

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: 'emergencyContacts',
  })

  return (
    <div className="space-y-6">
      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Informações Médicas
          </CardTitle>
          <CardDescription>
            Informe condições médicas relevantes (opcional, mas recomendado)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicalInfo.conditions">Condições médicas ou alergias</Label>
            <Textarea
              id="medicalInfo.conditions"
              placeholder="Descreva quaisquer condições médicas, alergias alimentares, restrições, etc."
              rows={3}
              {...register('medicalInfo.conditions')}
            />
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <Label>Medicamentos de uso contínuo</Label>
            {medicationFields.map((field, index) => (
              <div key={field.id} className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Medicamento {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(index)}
                    className="text-destructive h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Nome do medicamento"
                    {...register(`medicalInfo.medications.${index}.name`)}
                  />
                  <Input
                    placeholder="Dosagem (ex: 10mg)"
                    {...register(`medicalInfo.medications.${index}.dosage`)}
                  />
                  <Input
                    placeholder="Frequência (ex: 2x ao dia)"
                    {...register(`medicalInfo.medications.${index}.frequency`)}
                  />
                  <Input
                    placeholder="Instruções especiais"
                    {...register(`medicalInfo.medications.${index}.instructions`)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendMedication({ name: '', dosage: '', frequency: '', instructions: '' })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Medicamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contatos de Emergência
          </CardTitle>
          <CardDescription>
            Adicione pelo menos um contato de emergência (além dos responsáveis)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contactFields.map((field, index) => (
            <div key={field.id} className="p-3 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contato {index + 1}</span>
                {contactFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                    className="text-destructive h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome *</Label>
                  <Input
                    placeholder="Nome completo"
                    {...register(`emergencyContacts.${index}.name`, {
                      required: 'Nome é obrigatório',
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                      {...register(`emergencyContacts.${index}.phone`, {
                        required: 'Telefone é obrigatório',
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Parentesco *</Label>
                  <Select
                    value={watch(`emergencyContacts.${index}.relationship`)}
                    onValueChange={(value) =>
                      setValue(`emergencyContacts.${index}.relationship`, value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((rel) => (
                        <SelectItem key={rel.value} value={rel.value}>
                          {rel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendContact({ name: '', phone: '', relationship: 'OTHER' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Contato
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
