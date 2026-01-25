import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Copy, Check } from 'lucide-react'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Checkbox } from '../../components/ui/checkbox'
import { tuyau } from '../../lib/api'
import { useSubjectsQueryOptions } from '../../hooks/queries/use_subjects'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  subjectIds: z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof formSchema>

interface NewTeacherModalProps {
  schoolId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewTeacherModal({ schoolId, open, onOpenChange }: NewTeacherModalProps) {
  const queryClient = useQueryClient()
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: subjectsData } = useQuery(
    useSubjectsQueryOptions({ page: 1, limit: 100, schoolId })
  )

  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subjectIds: [],
    },
  })

  const { mutateAsync: createTeacher, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await tuyau.api.v1.teachers.$post({
        name: values.name,
        email: values.email,
        schoolId,
        subjectIds: values.subjectIds.length > 0 ? values.subjectIds : undefined,
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar professor')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const result = await createTeacher(values)
      if (result?.generatedPassword) {
        setGeneratedPassword(result.generatedPassword)
      } else {
        toast.success('Professor criado com sucesso!')
        handleClose()
      }
    } catch (error) {
      toast.error('Erro ao criar professor', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
      })
    }
  }

  function handleClose() {
    form.reset()
    setGeneratedPassword(null)
    setCopied(false)
    onOpenChange(false)
  }

  function handleCopyPassword() {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (generatedPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Professor criado com sucesso!</DialogTitle>
            <DialogDescription>
              Copie a senha gerada abaixo e envie para o professor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Senha temporária:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-lg font-mono bg-background p-2 rounded border">
                  {generatedPassword}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopyPassword}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              O professor deverá alterar a senha no primeiro acesso.
            </p>

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Professor</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do professor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {subjects.length > 0 && (
              <FormField
                control={form.control}
                name="subjectIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Disciplinas</FormLabel>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {subjects.map((subject) => (
                        <FormField
                          key={subject.id}
                          control={form.control}
                          name="subjectIds"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(subject.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || []
                                    if (checked) {
                                      field.onChange([...current, subject.id])
                                    } else {
                                      field.onChange(current.filter((id) => id !== subject.id))
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {subject.name}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                  'Criar Professor'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
