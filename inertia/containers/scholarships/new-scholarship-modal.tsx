import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import type { SchoolPartnersForSelectResponse } from '../../hooks/queries/use_school_partners_for_select'
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

import { useCreateScholarshipMutation } from '../../hooks/mutations/use_create_scholarship'
import { useSchoolPartnersForSelectQueryOptions } from '../../hooks/queries/use_school_partners_for_select'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountPercentage: z.preprocess((v) => Number(v), z.number().min(0).max(100)).optional(),
  enrollmentDiscountPercentage: z
    .preprocess((v) => Number(v), z.number().min(0).max(100))
    .optional(),
  discountValue: z.preprocess((v) => Number(v), z.number().min(0)).optional(),
  enrollmentDiscountValue: z.preprocess((v) => Number(v), z.number().min(0)).optional(),
  type: z.enum(['PHILANTHROPIC', 'DISCOUNT', 'COMPANY_PARTNERSHIP', 'FREE']),
  description: z.string().optional(),
  schoolPartnerId: z.string().optional(),
  code: z.string().optional(),
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
  const { data: partnersData } = useQuery<SchoolPartnersForSelectResponse>(
    useSchoolPartnersForSelectQueryOptions() as any
  )

  const partners = useMemo(() => {
    return (partnersData as any)?.data ?? []
  }, [partnersData])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      discountType: 'PERCENTAGE',
      discountPercentage: 0,
      enrollmentDiscountPercentage: 0,
      discountValue: 0,
      enrollmentDiscountValue: 0,
      type: 'PHILANTHROPIC',
      code: '',
    },
  })

  const discountType = form.watch('discountType')
  const isFlat = discountType === 'FLAT'

  async function handleSubmit(values: FormValues) {
    const payload: any = {
      name: values.name,
      discountType: values.discountType,
      type: values.type,
      description: values.description,
      schoolPartnerId: values.schoolPartnerId,
      code: values.code || undefined,
    }

    if (values.discountType === 'PERCENTAGE') {
      payload.discountPercentage = values.discountPercentage ?? 0
      payload.enrollmentDiscountPercentage = values.enrollmentDiscountPercentage ?? 0
    } else {
      payload.discountValue = values.discountValue ?? 0
      payload.enrollmentDiscountValue = values.enrollmentDiscountValue ?? 0
    }

    const promise = createScholarship.mutateAsync(payload).then(() => {
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
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Desconto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de desconto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Porcentagem (%)</SelectItem>
                      <SelectItem value="FLAT">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isFlat ? (
              <>
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto Mensalidade (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
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
                  name="enrollmentDiscountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto Matrícula (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
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
              </>
            )}

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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: XPTO20" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Usado na matrícula online para aplicar a bolsa
                  </p>
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
