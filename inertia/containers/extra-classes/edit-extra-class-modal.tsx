import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { useUpdateExtraClass } from '~/hooks/mutations/use_extra_class_mutations'
import { useExtraClassQueryOptions } from '~/hooks/queries/use_extra_classes'
import { useTeachersQueryOptions } from '~/hooks/queries/use_teachers'
import { useContractsQueryOptions } from '~/hooks/queries/use_contracts'

const DAY_OPTIONS = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda' },
  { value: '2', label: 'Terca' },
  { value: '3', label: 'Quarta' },
  { value: '4', label: 'Quinta' },
  { value: '5', label: 'Sexta' },
  { value: '6', label: 'Sabado' },
]

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z.string().nullable().optional(),
  contractId: z.string().min(1, 'Selecione o contrato'),
  teacherId: z.string().min(1, 'Selecione o professor'),
  maxStudents: z.coerce.number().positive().optional().or(z.literal('')).or(z.literal(0)),
  isActive: z.boolean().optional(),
  schedules: z
    .array(
      z.object({
        weekDay: z.coerce.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
      })
    )
    .min(1, 'Adicione ao menos um horario'),
})

type FormValues = z.infer<typeof schema>

interface EditExtraClassModalProps {
  extraClassId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditExtraClassModal({
  extraClassId,
  open,
  onOpenChange,
}: EditExtraClassModalProps) {
  const { data: extraClass, isLoading } = useQuery({
    ...useExtraClassQueryOptions(extraClassId),
    enabled: open,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      contractId: '',
      teacherId: '',
      maxStudents: '',
      schedules: [{ weekDay: 1, startTime: '14:00', endTime: '15:00' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'schedules',
  })
  const updateMutation = useUpdateExtraClass()

  const { data: teachersData } = useQuery(useTeachersQueryOptions({ limit: 100 }))
  const { data: contractsData } = useQuery(useContractsQueryOptions({ limit: 100 }))

  const teachers = teachersData?.data ?? []
  const contracts = contractsData?.data ?? []

  useEffect(() => {
    if (extraClass) {
      form.reset({
        name: extraClass.name,
        description: extraClass.description ?? '',
        contractId: extraClass.contractId,
        teacherId: extraClass.teacherId,
        maxStudents: extraClass.maxStudents ?? '',
        schedules:
          extraClass.schedules.length > 0
            ? extraClass.schedules.map((s) => ({
                weekDay: s.weekDay,
                startTime: s.startTime,
                endTime: s.endTime,
              }))
            : [{ weekDay: 1, startTime: '14:00', endTime: '15:00' }],
      })
    }
  }, [extraClass, form])

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(
      {
        id: extraClassId,
        ...values,
        maxStudents: values.maxStudents ? Number(values.maxStudents) : null,
        description: values.description || null,
        schedules: values.schedules.map((s) => ({
          weekDay: Number(s.weekDay),
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      },
      {
        onSuccess: () => {
          toast.success('Aula avulsa atualizada')
          onOpenChange(false)
        },
        onError: () => toast.error('Erro ao atualizar'),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Aula Avulsa</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea {...form.register('description')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Professor</Label>
                <Select
                  value={form.watch('teacherId')}
                  onValueChange={(v) => form.setValue('teacherId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.user?.name ?? t.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Contrato</Label>
                <Select
                  value={form.watch('contractId')}
                  onValueChange={(v) => form.setValue('contractId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Limite de Vagas</Label>
              <Input
                type="number"
                {...form.register('maxStudents')}
                placeholder="Ilimitado"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Horarios</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ weekDay: 1, startTime: '14:00', endTime: '15:00' })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Select
                      value={String(form.watch(`schedules.${index}.weekDay`))}
                      onValueChange={(v) =>
                        form.setValue(`schedules.${index}.weekDay`, Number(v) as any)
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAY_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      {...form.register(`schedules.${index}.startTime`)}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      {...form.register(`schedules.${index}.endTime`)}
                      className="w-20"
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
