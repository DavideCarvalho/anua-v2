import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'

import { useCreateSchoolPartnerMutation } from '../../hooks/mutations/use_create_school_partner'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  contactName: z.string().optional().or(z.literal('')),
  discountPercentage: z.preprocess((v) => Number(v), z.number().min(0).max(100)),
  partnershipStartDate: z.string().min(1, 'Data de início é obrigatória'),
  partnershipEndDate: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function NewSchoolPartnerModal({
  open,
  onCancel,
  onSubmit,
}: {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
}) {
  const createPartner = useCreateSchoolPartnerMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      discountPercentage: 0,
      partnershipStartDate: new Date().toISOString().slice(0, 10),
    },
  })

  async function handleSubmit(values: FormValues) {
    const promise = createPartner
      .mutateAsync({
        name: values.name,
        cnpj: values.cnpj,
        email: values.email || undefined,
        phone: values.phone || undefined,
        contactName: values.contactName || undefined,
        discountPercentage: values.discountPercentage,
        partnershipStartDate: new Date(values.partnershipStartDate),
        partnershipEndDate: values.partnershipEndDate
          ? new Date(values.partnershipEndDate)
          : undefined,
      } as any)
      .then(() => {
        toast.success('Parceiro criado com sucesso!')
        form.reset()
        onSubmit()
      })

    toast.promise(promise, {
      loading: 'Criando parceiro...',
      error: 'Erro ao criar parceiro',
    })

    return promise
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Parceiro</DialogTitle>
        </DialogHeader>

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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPartner.isPending}>
                {createPartner.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
