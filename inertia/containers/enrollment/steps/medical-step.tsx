import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2, UserCheck } from 'lucide-react'
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
import type { EnrollmentFormData } from '../schema'

export function MedicalInfoStep() {
  const form = useFormContext<EnrollmentFormData>()
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
  const emergencyGuardians = responsibles.filter((r) => r.isEmergencyContact)

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
          {/* Read-only emergency contacts from guardians marked as isEmergencyContact */}
          {emergencyGuardians.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Responsáveis marcados como contato de emergência:</p>
              {emergencyGuardians.map((resp, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{resp.name}</span>
                  <span className="text-xs text-muted-foreground">— {resp.phone}</span>
                </div>
              ))}
            </div>
          )}

          {emergencyGuardians.length === 0 && emergencyContacts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Pelo menos um contato de emergência é obrigatório
            </p>
          )}

          {/* Additional manual emergency contacts */}
          {emergencyContacts.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`medicalInfo.emergencyContacts.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do contato" />
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
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmergencyContact(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
