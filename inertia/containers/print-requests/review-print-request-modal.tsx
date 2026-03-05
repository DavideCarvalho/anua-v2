import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
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

import { useMutation } from '@tanstack/react-query'
import { api } from '~/lib/api'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  fileUrl: z.string().url('Informe uma URL válida'),
  quantity: z.number().min(1),
  dueDate: z.string().min(1, 'Data é obrigatória'),
  frontAndBack: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function ReviewPrintRequestModal({
  printRequestId,
  open,
  onClose,
}: {
  printRequestId: string
  open: boolean
  onClose: () => void
}) {
  const review = useMutation(api.api.v1.printRequests.reviewPrintRequest.mutationOptions())

  const { data } = useQuery({
    ...api.api.v1.printRequests.showPrintRequest.queryOptions({
      params: { id: printRequestId },
    }),
    enabled: !!printRequestId,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      frontAndBack: false,
      dueDate: new Date().toISOString().slice(0, 10),
    },
  })

  useEffect(() => {
    if (!data) return
    form.reset({
      name: data.name,
      fileUrl: data.path,
      quantity: data.quantity,
      dueDate: String(data.dueDate).slice(0, 10),
      frontAndBack: data.frontAndBack,
    })
  }, [data, form])

  async function handleSubmit(values: FormValues) {
    const promise = review
      .mutateAsync({
        params: { id: printRequestId },
        body: {
          name: values.name,
          fileUrl: values.fileUrl,
          quantity: values.quantity,
          dueDate: values.dueDate,
          frontAndBack: values.frontAndBack,
        },
      })
      .then(() => {
        toast.success('Solicitação revisada com sucesso!')
        onClose()
      })

    toast.promise(promise, {
      loading: 'Salvando revisão...',
      error: 'Erro ao revisar solicitação',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 py-4">
            <DialogHeader>
              <DialogTitle>Revisar solicitação</DialogTitle>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do arquivo</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={review.isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
