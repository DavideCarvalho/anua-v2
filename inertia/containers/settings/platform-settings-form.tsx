import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'

import { usePlatformSettings } from '../../hooks/queries/use-platform-settings'
import { useUpdatePlatformSettings } from '../../hooks/mutations/use-platform-settings-mutations'

const platformSettingsSchema = z.object({
  defaultTrialDays: z.number().int().min(0, 'Dias de trial devem ser positivos'),
  defaultPricePerStudent: z.number().int().min(0, 'Preço por aluno deve ser positivo'),
})

type PlatformSettingsFormData = z.infer<typeof platformSettingsSchema>

export function PlatformSettingsForm() {
  const { data: platformSettings } = usePlatformSettings()
  const { mutateAsync: updateSettings, isPending } = useUpdatePlatformSettings()

  const form = useForm<PlatformSettingsFormData>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      defaultTrialDays: platformSettings?.defaultTrialDays ?? 0,
      defaultPricePerStudent: platformSettings?.defaultPricePerStudent ?? 0,
    },
  })

  const onSubmit = async (data: PlatformSettingsFormData) => {
    try {
      await updateSettings({
        defaultTrialDays: data.defaultTrialDays,
        defaultPricePerStudent: data.defaultPricePerStudent,
      })

      toast.success('Configurações atualizadas com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar configurações')
    }
  }

  const formatCurrency = (value: number) => {
    return `R$ ${(value / 100).toFixed(2).replace('.', ',')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Plataforma</CardTitle>
        <CardDescription>Configure os valores padrão para novas escolas</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="defaultTrialDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias de Trial Padrão</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de dias de acesso gratuito para novas escolas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultPricePerStudent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço por Aluno Ativo Padrão</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={field.value ? formatCurrency(field.value) : ''}
                      onChange={(e) => {
                        // Remove tudo exceto números
                        const rawValue = e.target.value.replace(/\D/g, '')
                        // Converte para centavos
                        const centavos = rawValue ? parseInt(rawValue, 10) : 0
                        field.onChange(centavos)
                      }}
                    />
                  </FormControl>
                  <FormDescription>Valor padrão cobrado por aluno ativo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Preview:</strong> Novas escolas terão {form.watch('defaultTrialDays')} dias
                de trial e pagarão {formatCurrency(form.watch('defaultPricePerStudent'))} por aluno
                ativo
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Resetar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
