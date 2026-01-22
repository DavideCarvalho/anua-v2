import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { tuyau } from '../../lib/api'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  enrollmentValue: z.string().optional(),
  amount: z.string().min(1, 'Valor do curso é obrigatório'),
  paymentType: z.enum(['MONTHLY', 'UPFRONT']),
  enrollmentValueInstallments: z.string().optional(),
  installments: z.string().min(1, 'Número de parcelas é obrigatório'),
})

type FormValues = z.infer<typeof formSchema>

interface NewContractModalProps {
  schoolId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewContractModal({ schoolId, open, onOpenChange }: NewContractModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      enrollmentValue: '',
      amount: '',
      paymentType: 'MONTHLY',
      enrollmentValueInstallments: '1',
      installments: '12',
    },
  })

  const { mutateAsync: createContract, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await tuyau.api.v1.contracts.$post({
        schoolId,
        name: values.name,
        description: values.description || undefined,
        enrollmentValue: values.enrollmentValue
          ? Math.round(Number(values.enrollmentValue) * 100)
          : undefined,
        amount: Math.round(Number(values.amount) * 100),
        paymentType: values.paymentType,
        enrollmentValueInstallments: values.enrollmentValueInstallments
          ? Number(values.enrollmentValueInstallments)
          : undefined,
        installments: Number(values.installments),
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar contrato')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await createContract(values)
      toast.success('Contrato criado com sucesso!')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Erro ao criar contrato', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Contrato</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contrato</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Contrato Anual 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do contrato..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enrollmentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Matrícula</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" placeholder="0,00" />
                    </FormControl>
                    <FormDescription>Em reais</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Curso</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" placeholder="0,00" />
                    </FormControl>
                    <FormDescription>Em reais</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Mensal</SelectItem>
                      <SelectItem value="UPFRONT">À Vista</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enrollmentValueInstallments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcelas da Matrícula</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcelas do Curso</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Contrato'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
