import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog'
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

import { useCreateSubjectMutation } from '../../hooks/mutations/use_create_subject'

const schema = z.object({
  name: z.string().min(1, 'Qual o nome da matéria?'),
})

type FormValues = z.infer<typeof schema>

export function NewSubjectModal({
  open,
  onCancel,
  onSubmit,
  schoolId,
}: {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
  schoolId: string
}) {
  const createSubject = useCreateSubjectMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '' },
  })

  async function handleSubmit(values: FormValues) {
    const promise = createSubject
      .mutateAsync({
        name: values.name,
        schoolId,
      } as any)
      .then(() => {
        toast.success('Matéria criada com sucesso!')
        form.reset()
        onSubmit()
      })

    toast.promise(promise, {
      loading: 'Criando matéria...',
      error: 'Erro ao criar matéria',
    })

    return promise
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar nova matéria</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Matéria*</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da matéria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createSubject.isPending}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
