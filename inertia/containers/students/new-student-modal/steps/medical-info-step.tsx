import { useFieldArray, useFormContext } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { Plus, Trash2, GripVertical, UserCheck } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import {
  type NewStudentFormData,
  EmergencyContactRelationship,
  EmergencyContactRelationshipLabels,
} from '../schema'

export function MedicalInfoStep() {
  const form = useFormContext<NewStudentFormData>()
  const customError = form.formState.errors.root?.message

  const {
    fields: medications,
    append: appendMedication,
    remove: removeMedication,
  } = useFieldArray({ control: form.control, name: 'medicalInfo.medications' })

  const {
    fields: emergencyContacts,
    append: appendEmergencyContact,
    remove: removeEmergencyContact,
  } = useFieldArray({
    control: form.control,
    name: 'medicalInfo.emergencyContacts',
  })

  const responsibles = form.watch('responsibles')
  const watchedEmergencyContacts = form.watch('medicalInfo.emergencyContacts')

  // Track which responsibleIndexes are already used
  const usedResponsibleIndexes = useMemo(() => {
    const indexes = new Set<number>()
    watchedEmergencyContacts?.forEach((contact) => {
      if (contact.responsibleIndex != null) {
        indexes.add(contact.responsibleIndex)
      }
    })
    return indexes
  }, [watchedEmergencyContacts])

  // If a responsible is removed, clear emergency contacts linked to it
  useEffect(() => {
    watchedEmergencyContacts?.forEach((contact, contactIndex) => {
      if (
        contact.responsibleIndex != null &&
        contact.responsibleIndex >= responsibles.length
      ) {
        form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.responsibleIndex`, undefined)
        form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.name`, '')
        form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.phone`, '')
        form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.relationship`, 'OTHER')
      }
    })
  }, [responsibles.length])

  const handleSelectResponsible = (contactIndex: number, value: string) => {
    if (value === 'manual') {
      form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.responsibleIndex`, undefined)
      form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.name`, '')
      form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.phone`, '')
      form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.relationship`, 'OTHER')
      return
    }

    const respIndex = parseInt(value, 10)
    const resp = responsibles[respIndex]
    if (!resp) return

    form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.responsibleIndex`, respIndex)
    form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.name`, resp.name)
    form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.phone`, resp.phone)
  }

  // Sync responsible data changes to linked emergency contacts
  const responsibleDataKey = responsibles
    .map((r) => `${r.name}|${r.phone}`)
    .join('\0')

  useEffect(() => {
    watchedEmergencyContacts?.forEach((contact, contactIndex) => {
      if (contact.responsibleIndex != null) {
        const resp = responsibles[contact.responsibleIndex]
        if (resp) {
          form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.name`, resp.name)
          form.setValue(`medicalInfo.emergencyContacts.${contactIndex}.phone`, resp.phone)
        }
      }
    })
  }, [responsibleDataKey])

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condições Médicas</CardTitle>
        </CardHeader>
        <CardContent>
          {customError && <div className="mb-4 text-sm text-destructive">{customError}</div>}
          <FormField
            control={form.control}
            name="medicalInfo.conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condições e alergias</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Descreva condições médicas, alergias ou necessidades especiais do aluno"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Medicamentos</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendMedication({
                  name: '',
                  dosage: '',
                  frequency: '',
                  instructions: '',
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhum medicamento adicionado
            </p>
          )}
          {medications.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`medicalInfo.medications.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do medicamento" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`medicalInfo.medications.${index}.dosage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosagem*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: 500mg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`medicalInfo.medications.${index}.frequency`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: 2x ao dia" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`medicalInfo.medications.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instruções</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Instruções adicionais" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Contatos de Emergência*</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendEmergencyContact({
                  name: '',
                  phone: '',
                  relationship: 'OTHER',
                  order: emergencyContacts.length,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergencyContacts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Pelo menos um contato de emergência é obrigatório
            </p>
          )}
          {emergencyContacts.map((field, index) => {
            const isLinked = watchedEmergencyContacts?.[index]?.responsibleIndex != null
            const currentResponsibleIndex = watchedEmergencyContacts?.[index]?.responsibleIndex

            return (
              <Card key={field.id}>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-6 h-10 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <Label className="flex items-center h-10 text-sm font-medium">
                      Prioridade {index + 1}
                    </Label>
                  </div>

                  {responsibles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={
                          currentResponsibleIndex != null
                            ? String(currentResponsibleIndex)
                            : 'manual'
                        }
                        onValueChange={(value) => handleSelectResponsible(index, value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecionar responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Outro contato</SelectItem>
                          {responsibles.map((resp, respIndex) => {
                            const isUsedByOther =
                              usedResponsibleIndexes.has(respIndex) &&
                              currentResponsibleIndex !== respIndex
                            return (
                              <SelectItem
                                key={respIndex}
                                value={String(respIndex)}
                                disabled={isUsedByOther}
                              >
                                {resp.name || `Responsável ${respIndex + 1}`}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`medicalInfo.emergencyContacts.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome*</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nome do contato"
                              disabled={isLinked}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medicalInfo.emergencyContacts.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone*</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={11}
                              placeholder="11999999999"
                              disabled={isLinked}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '')
                                field.onChange(value)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <FormField
                      control={form.control}
                      name={`medicalInfo.emergencyContacts.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Parentesco*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLinked}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EmergencyContactRelationship.map((rel) => (
                                <SelectItem key={rel} value={rel}>
                                  {EmergencyContactRelationshipLabels[rel]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmergencyContact(index)}
                      className="mb-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
