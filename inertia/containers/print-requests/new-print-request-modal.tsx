import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  fileUrl: z.string().url('Informe uma URL válida'),
  quantity: z.number().min(1),
  dueDate: z.string().min(1, 'Data é obrigatória'),
  frontAndBack: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function NewPrintRequestModal({
  open,
  onCancel,
  onSubmit,
}: {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
}) {
  const queryClient = useQueryClient()
  const createRequest = useMutation(api.api.v1.printRequests.createPrintRequest.mutationOptions())

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      frontAndBack: false,
      quantity: 1,
    },
  })

  async function handleSubmit(values: FormValues) {
    const promise = createRequest
      .mutateAsync({
        body: {
          name: values.name,
          fileUrl: values.fileUrl,
          quantity: values.quantity,
          dueDate: values.dueDate,
          frontAndBack: values.frontAndBack,
        },
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['print-requests'] })
        toast.success('Solicitação criada com sucesso!')
        form.reset()
        onSubmit()
      })

    toast.promise(promise, {
      loading: 'Criando solicitação...',
      error: 'Erro ao criar solicitação',
    })

    return promise
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova solicitação de impressão</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do arquivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do arquivo</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={typeof field.value === 'number' ? field.value : 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para quando?</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frontAndBack"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Imprimir frente e verso</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
