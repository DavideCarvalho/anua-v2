import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
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
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { tuyau } from '../../lib/api'
import { type CreateSchoolChainFormData, createSchoolChainSchema } from './schema'

interface CreateSchoolChainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (schoolChain: { id: string; name: string }) => void
  defaultPlatformSettings?: {
    defaultTrialDays: number
    defaultPricePerStudent: number
  }
}

export function CreateSchoolChainDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultPlatformSettings,
}: CreateSchoolChainDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<CreateSchoolChainFormData>({
    resolver: zodResolver(createSchoolChainSchema),
    defaultValues: {
      name: '',
      subscriptionLevel: 'INDIVIDUAL',
      trialDays: defaultPlatformSettings?.defaultTrialDays ?? 30,
      pricePerStudent: defaultPlatformSettings?.defaultPricePerStudent ?? 1290,
    },
  })

  const { mutateAsync: createSchoolChain, isPending } = useMutation({
    mutationFn: async (data: CreateSchoolChainFormData) => {
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const response = await tuyau.api.v1['school-chains'].$post({
        name: data.name,
        slug,
        subscriptionLevel: data.subscriptionLevel,
      })
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao criar rede')
      }
      return response.data
    },
  })

  const subscriptionLevel = form.watch('subscriptionLevel')
  const isNetworkSubscription = subscriptionLevel === 'NETWORK'

  const onSubmit = async (data: CreateSchoolChainFormData) => {
    try {
      const result = await createSchoolChain(data)

      toast.success('Rede de ensino criada com sucesso!')

      await queryClient.invalidateQueries({
        queryKey: ['school-chains'],
      })

      form.reset()
      onOpenChange(false)

      if (onSuccess && result) {
        onSuccess({
          id: result.id,
          name: result.name,
        })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar rede de ensino')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Rede de Ensino</DialogTitle>
          <DialogDescription>
            Configure uma nova rede de ensino e seu modelo de assinatura
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Rede</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rede XYZ de Educação" {...field} />
                  </FormControl>
                  <FormDescription>O identificador (slug) será gerado automaticamente</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscriptionLevel"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Modelo de Assinatura</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <RadioGroupItem value="INDIVIDUAL" />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">Assinatura Individual por Escola</FormLabel>
                          <FormDescription>
                            Cada escola da rede terá sua própria assinatura, trial e cobrança separada
                          </FormDescription>
                        </div>
                      </FormItem>
                      <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <RadioGroupItem value="NETWORK" />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">Assinatura Única para a Rede</FormLabel>
                          <FormDescription>
                            Todas as escolas da rede compartilham uma única assinatura e cobrança
                            centralizada
                          </FormDescription>
                        </div>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isNetworkSubscription && (
              <>
                <FormField
                  control={form.control}
                  name="trialDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias de Trial</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Período de teste gratuito para a rede</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pricePerStudent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço por Aluno Ativo</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="R$ 0,00"
                          value={
                            field.value ? `R$ ${(field.value / 100).toFixed(2).replace('.', ',')}` : ''
                          }
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '')
                            const centavos = rawValue ? parseInt(rawValue, 10) : 0
                            field.onChange(centavos)
                          }}
                        />
                      </FormControl>
                      <FormDescription>Valor cobrado por aluno ativo na rede</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Criando...' : 'Criar Rede'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
