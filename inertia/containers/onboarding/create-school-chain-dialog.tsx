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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import { api } from '~/lib/api'
import { type CreateSchoolChainFormData, createSchoolChainSchema } from './schema'

interface CreateSchoolChainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (schoolChain: { id: string; name: string }) => void
}

export function CreateSchoolChainDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSchoolChainDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<CreateSchoolChainFormData>({
    resolver: zodResolver(createSchoolChainSchema),
    defaultValues: {
      name: '',
      directorName: '',
      directorEmail: '',
      directorPhone: '',
      directorDocumentNumber: '',
    },
  })

  const createSchoolChainMutation = useMutation(
    api.api.v1.schoolChains.createSchoolChain.mutationOptions()
  )
  const isPending = createSchoolChainMutation.isPending

  const createSchoolChain = async (data: CreateSchoolChainFormData) => {
    const slug = data.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const response = await createSchoolChainMutation.mutateAsync({
      body: {
        name: data.name,
        slug,
        subscriptionLevel: 'NETWORK',
        directorName: data.directorName,
        directorEmail: data.directorEmail,
        directorPhone: data.directorPhone,
        directorDocumentNumber: data.directorDocumentNumber,
      },
    })
    return response
  }

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
          <DialogDescription>Cadastre uma nova rede de ensino</DialogDescription>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="directorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável da Rede</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="directorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Responsável</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="responsavel@rede.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="directorPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Somente números" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="directorDocumentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ do Responsável</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Somente números"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
