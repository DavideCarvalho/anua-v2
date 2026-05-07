import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import {
  PERIOD_STRUCTURE_OPTIONS,
  RECOVERY_METHOD_OPTIONS,
} from '../schemas/edit_academic_period.schema'
import { AcademicPeriodFormValues } from '../new-academic-period-form'

export function SubPeriodsConfigForm() {
  const form = useFormContext<AcademicPeriodFormValues>()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estrutura de Sub-Períodos</CardTitle>
          <CardDescription>
            Configure a divisão deste período letivo em bimestres, trimestres ou semestres
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <FormField
            control={form.control}
            name="calendar.periodStructure"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Estrutura de Períodos</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {PERIOD_STRUCTURE_OPTIONS.map((opt) => (
                      <FormItem
                        key={opt.value}
                        className="flex cursor-pointer items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:border-primary has-data-[state=checked]:border-primary"
                        onClick={() => field.onChange(opt.value)}
                      >
                        <FormControl onClick={(e) => e.stopPropagation()}>
                          <RadioGroupItem value={opt.value} className="mt-0.5" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="cursor-pointer font-medium leading-none">
                            {opt.label}
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="calendar.recoveryGradeMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Método de Recuperação</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {RECOVERY_METHOD_OPTIONS.map((opt) => (
                      <FormItem
                        key={opt.value}
                        className="flex cursor-pointer items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:border-primary has-data-[state=checked]:border-primary"
                        onClick={() => field.onChange(opt.value)}
                      >
                        <FormControl onClick={(e) => e.stopPropagation()}>
                          <RadioGroupItem value={opt.value} className="mt-0.5" />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="cursor-pointer font-medium leading-none">
                            {opt.label}
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        Nota: Os sub-períodos específicos (datas, pesos) poderão ser gerados e editados após a
        criação do período letivo.
      </div>
    </div>
  )
}
