import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Plus, Trash2, Tag } from 'lucide-react'
import type { EnrollmentFormData } from '../schema'

export function IndividualDiscountsSection() {
  const form = useFormContext<EnrollmentFormData>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'billing.individualDiscounts',
  })

  const addDiscount = () => {
    // Business rule: either scholarship OR individual discounts
    form.setValue('billing.scholarshipId', null)
    form.setValue('billing.discountPercentage', 0)
    form.setValue('billing.enrollmentDiscountPercentage', 0)

    append({
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountPercentage: 0,
      enrollmentDiscountPercentage: 0,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Descontos Individuais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum desconto individual adicionado. Clique no botão abaixo para adicionar.
          </p>
        )}

        {fields.map((field, index) => {
          const discountType = form.watch(`billing.individualDiscounts.${index}.discountType`)
          const isFlat = discountType === 'FLAT'

          return (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-4">
                  <div>
                    <Label>Nome do Desconto *</Label>
                    <Input
                      {...form.register(`billing.individualDiscounts.${index}.name`)}
                      placeholder="Ex: Desconto de funcionário"
                    />
                  </div>

                  <div>
                    <Label>Descrição (opcional)</Label>
                    <Input
                      {...form.register(`billing.individualDiscounts.${index}.description`)}
                      placeholder="Descrição do desconto"
                    />
                  </div>

                  <div>
                    <Label>Tipo de Desconto</Label>
                    <Select
                      value={discountType}
                      onValueChange={(value: 'PERCENTAGE' | 'FLAT') => {
                        form.setValue(`billing.individualDiscounts.${index}.discountType`, value)
                        // Reset values when changing type
                        if (value === 'PERCENTAGE') {
                          form.setValue(
                            `billing.individualDiscounts.${index}.discountPercentage`,
                            0
                          )
                          form.setValue(
                            `billing.individualDiscounts.${index}.enrollmentDiscountPercentage`,
                            0
                          )
                        } else {
                          form.setValue(`billing.individualDiscounts.${index}.discountValue`, 0)
                          form.setValue(
                            `billing.individualDiscounts.${index}.enrollmentDiscountValue`,
                            0
                          )
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem>
                        <SelectItem value="FLAT">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {isFlat ? (
                      <>
                        <div>
                          <Label>Desconto Mensalidade (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(
                              `billing.individualDiscounts.${index}.discountValue`,
                              {
                                valueAsNumber: true,
                              }
                            )}
                          />
                        </div>
                        <div>
                          <Label>Desconto Matrícula (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(
                              `billing.individualDiscounts.${index}.enrollmentDiscountValue`,
                              {
                                valueAsNumber: true,
                              }
                            )}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>Desconto Mensalidade (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            {...form.register(
                              `billing.individualDiscounts.${index}.discountPercentage`,
                              {
                                valueAsNumber: true,
                              }
                            )}
                          />
                        </div>
                        <div>
                          <Label>Desconto Matrícula (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            {...form.register(
                              `billing.individualDiscounts.${index}.enrollmentDiscountPercentage`,
                              {
                                valueAsNumber: true,
                              }
                            )}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}

        <Button type="button" variant="outline" onClick={addDiscount} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Desconto Individual
        </Button>
      </CardContent>
    </Card>
  )
}
