import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
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

import { useCreateAcademicPeriodMutation } from '../../hooks/mutations/use-create-academic-period'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  segment: z.enum(['KINDERGARTEN', 'ELEMENTARY', 'HIGHSCHOOL', 'TECHNICAL', 'UNIVERSITY', 'OTHER']),
})

type FormValues = z.infer<typeof schema>

export function NewAcademicPeriodForm({
  schoolId,
  onSuccess,
}: {
  schoolId: string
  onSuccess?: () => void
}) {
  const createAcademicPeriod = useCreateAcademicPeriodMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      segment: 'ELEMENTARY',
    },
  })

  async function handleSubmit(values: FormValues) {
    const promise = createAcademicPeriod
      .mutateAsync({
        name: values.name,
        schoolId,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        segment: values.segment,
      } as any)
      .then(() => {
        toast.success('Período letivo criado com sucesso!')
        onSuccess?.()
      })

    toast.promise(promise, {
      loading: 'Criando período letivo...',
      error: 'Erro ao criar período letivo',
    })

    return promise
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-w-xl">
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
          name="segment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segmento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="KINDERGARTEN">Educação Infantil</SelectItem>
                  <SelectItem value="ELEMENTARY">Fundamental</SelectItem>
                  <SelectItem value="HIGHSCHOOL">Médio</SelectItem>
                  <SelectItem value="TECHNICAL">Técnico</SelectItem>
                  <SelectItem value="UNIVERSITY">Universitário</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de início</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de término</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createAcademicPeriod.isPending}>
          Criar período letivo
        </Button>
      </form>
    </Form>
  )
}
