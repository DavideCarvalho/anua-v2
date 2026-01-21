'use client'

import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Minus } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const schema = z.object({
  name: z.string().min(1, 'Nome da turma é obrigatório'),
  teachers: z.array(
    z.object({
      teacherId: z.string().min(1, 'Selecione um professor'),
      subjectId: z.string().min(1, 'Selecione uma disciplina'),
      subjectQuantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    })
  ).default([]),
})

type FormValues = z.infer<typeof schema>

interface Teacher {
  id: string
  user: { name: string }
}

interface Subject {
  id: string
  name: string
}

interface NewClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: FormValues) => void
  teachers: Teacher[]
  subjects: Subject[]
  initialData?: {
    name: string
    teachers?: Array<{
      teacherId: string
      subjectId: string
      subjectQuantity: number
    }>
  }
}

export function NewClassModal({
  open,
  onOpenChange,
  onSave,
  teachers,
  subjects,
  initialData,
}: NewClassModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      teachers: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'teachers',
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          teachers: initialData.teachers || [],
        })
      } else {
        form.reset({
          name: '',
          teachers: [],
        })
      }
    }
  }, [open, initialData, form])

  const onSubmit = (data: FormValues) => {
    onSave(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{initialData ? 'Editar Turma' : 'Nova Turma'}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da turma</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Turma A, Turma B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Professores e Disciplinas</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ teacherId: '', subjectId: '', subjectQuantity: 1 })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhum professor vinculado. Clique em "Adicionar" para vincular professores e disciplinas.
                    </p>
                  )}
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Aula {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`teachers.${index}.teacherId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Professor</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                      {teacher.user.name}
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
                          name={`teachers.${index}.subjectId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Disciplina</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                      {subject.name}
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
                          name={`teachers.${index}.subjectQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aulas/semana</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
