import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Switch } from '../../components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'

import { useSchoolPartnerQueryOptions } from '../../hooks/queries/use_school_partner'
import { useUpdateSchoolPartnerMutation } from '../../hooks/mutations/use_update_school_partner'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  contactName: z.string().optional().or(z.literal('')),
  discountPercentage: z.preprocess((v) => Number(v), z.number().min(0).max(100)),
  partnershipStartDate: z.string().min(1, 'Data de início é obrigatória'),
  partnershipEndDate: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function EditSchoolPartnerModal({
  partnerId,
  open,
  onCancel,
}: {
  partnerId: string
  open: boolean
  onCancel: () => void
}) {
  const updatePartner = useUpdateSchoolPartnerMutation()

  const { data: partner, isLoading } = useQuery({
    ...useSchoolPartnerQueryOptions({ id: partnerId }),
    enabled: !!partnerId,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      partnershipStartDate: new Date().toISOString().slice(0, 10),
      isActive: true,
    },
  })

  function toDateInput(value: any) {
    if (!value) return ''
    if (typeof value === 'string') return value.slice(0, 10)
    if (value instanceof Date) return value.toISOString().slice(0, 10)
    if (typeof value.toISO === 'function') return (value.toISO() ?? '').slice(0, 10)
    return ''
  }

  useEffect(() => {
    if (!partner) return

    form.reset({
      name: partner.name,
      cnpj: partner.cnpj,
      email: partner.email ?? '',
      phone: partner.phone ?? '',
      contactName: partner.contactName ?? '',
      discountPercentage: partner.discountPercentage,
      partnershipStartDate: toDateInput(partner.partnershipStartDate),
      partnershipEndDate: toDateInput(partner.partnershipEndDate),
      isActive: !!partner.isActive,
    })
  }, [partner, form])

  async function handleSubmit(values: FormValues) {
    const promise = updatePartner
      .mutateAsync({
        params: { id: partnerId },
        body: {
          name: values.name,
          cnpj: values.cnpj,
          email: values.email || undefined,
          phone: values.phone || undefined,
          contactName: values.contactName || undefined,
          discountPercentage: values.discountPercentage,
          partnershipStartDate: new Date(values.partnershipStartDate),
          partnershipEndDate: values.partnershipEndDate
            ? new Date(values.partnershipEndDate)
            : null,
          isActive: values.isActive,
        } as any,
      })
      .then(() => {
        toast.success('Parceiro atualizado com sucesso!')
        onCancel()
      })

    toast.promise(promise, {
      loading: 'Atualizando parceiro...',
      error: 'Erro ao atualizar parceiro',
    })

    return promise
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? 'Carregando...' : partner ? 'Editar Parceiro' : 'Parceiro não encontrado'}
          </DialogTitle>
        </DialogHeader>

        {!partner ? null : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentagem de Desconto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partnershipStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partnershipEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updatePartner.isPending}>
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
