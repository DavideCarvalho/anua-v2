import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
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

import { useScholarshipQueryOptions } from '../../hooks/queries/use-scholarship'
import { useSchoolPartnersForSelectQueryOptions } from '../../hooks/queries/use-school-partners-for-select'
import { useUpdateScholarshipMutation } from '../../hooks/mutations/use-update-scholarship'

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

export function EditScholarshipModal({
  scholarshipId,
  open,
  onCancel,
}: {
  scholarshipId: string
  open: boolean
  onCancel: () => void
}) {
  const updateScholarship = useUpdateScholarshipMutation()

  const { data: partnersData } = useQuery<SchoolPartnersForSelectResponse>(
    useSchoolPartnersForSelectQueryOptions() as any
  )
  const partners = useMemo(() => {
    if (Array.isArray(partnersData)) return partnersData
    return partnersData?.data ?? []
  }, [partnersData])

  const { data: scholarship } = useQuery({
    ...useScholarshipQueryOptions({ id: scholarshipId }),
    enabled: !!scholarshipId,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      discountPercentage: 0,
      enrollmentDiscountPercentage: 0,
      type: 'PHILANTHROPIC',
      description: '',
      schoolPartnerId: undefined,
    },
  })

  useEffect(() => {
    if (!scholarship) return

    form.reset({
      name: scholarship.name,
      discountPercentage: scholarship.discountPercentage,
      enrollmentDiscountPercentage: scholarship.enrollmentDiscountPercentage ?? 0,
      type: scholarship.type,
      description: scholarship.description ?? '',
      schoolPartnerId: scholarship.schoolPartnerId ?? undefined,
    })
  }, [scholarship, form])

  async function handleSubmit(values: FormValues) {
    const promise = updateScholarship
      .mutateAsync({
        params: { id: scholarshipId },
        body: {
          name: values.name,
          discountPercentage: values.discountPercentage,
          enrollmentDiscountPercentage: values.enrollmentDiscountPercentage ?? 0,
          type: values.type,
          description: values.description,
          schoolPartnerId: values.schoolPartnerId,
        },
      })
      .then(() => {
        toast.success('Bolsa editada com sucesso!')
        onCancel()
      })

    toast.promise(promise, {
      loading: 'Editando bolsa...',
      error: 'Erro ao editar bolsa',
    })

    return promise
  }

  if (!scholarship) return null

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Bolsa</DialogTitle>
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
                  <FormLabel>Desconto (%)</FormLabel>
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
              <Button type="submit" disabled={updateScholarship.isPending}>
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
