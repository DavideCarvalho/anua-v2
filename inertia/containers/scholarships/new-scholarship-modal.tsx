import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { SchoolPartnersForSelectResponse } from '../../hooks/queries/use-school-partners-for-select'
import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'

import { useCreateScholarshipMutation } from '../../hooks/mutations/use-create-scholarship'
import { useSchoolPartnersForSelectQueryOptions } from '../../hooks/queries/use-school-partners-for-select'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  discountPercentage: z.preprocess((v) => Number(v), z.number().min(0).max(100)),
  enrollmentDiscountPercentage: z
    .preprocess((v) => Number(v), z.number().min(0).max(100))
    .optional(),
  type: z.enum(['PHILANTHROPIC', 'DISCOUNT', 'COMPANY_PARTNERSHIP', 'FREE']),
  description: z.string().optional(),
  schoolPartnerId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function NewScholarshipModal({
  open,
  onCancel,
  onSubmit,
}: {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
}) {
  const createScholarship = useCreateScholarshipMutation()
  const { data: partnersData } = useSuspenseQuery<SchoolPartnersForSelectResponse>(
    useSchoolPartnersForSelectQueryOptions() as any
  )

  const partners = useMemo(() => {
    if (Array.isArray(partnersData)) return partnersData
    return partnersData?.data ?? []
  }, [partnersData])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      discountPercentage: 0,
      enrollmentDiscountPercentage: 0,
      type: 'PHILANTHROPIC',
    },
  })

  async function handleSubmit(values: FormValues) {
    const promise = createScholarship
      .mutateAsync({
        name: values.name,
        discountPercentage: values.discountPercentage,
        enrollmentDiscountPercentage: values.enrollmentDiscountPercentage ?? 0,
        type: values.type,
        description: values.description,
        schoolPartnerId: values.schoolPartnerId,
      })
      .then(() => {
        form.reset()
        onSubmit()
        toast.success('Bolsa criada com sucesso!')
      })

    toast.promise(promise, {
      loading: 'Criando bolsa...',
      error: 'Erro ao criar bolsa',
    })

    return promise
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Bolsa</DialogTitle>
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
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desconto Mensalidade (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
              name="enrollmentDiscountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desconto Matrícula (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PHILANTHROPIC">Filantrópica</SelectItem>
                      <SelectItem value="DISCOUNT">Desconto</SelectItem>
                      <SelectItem value="COMPANY_PARTNERSHIP">Parceria Empresarial</SelectItem>
                      <SelectItem value="FREE">Gratuita</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schoolPartnerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parceiro</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parceiro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {partners.map((partner: any) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createScholarship.isPending}>
                {createScholarship.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
