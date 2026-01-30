import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { tuyau } from '../../lib/api'

const EMPLOYEE_ROLES = [
  { value: 'SCHOOL_DIRECTOR', label: 'Diretor' },
  { value: 'SCHOOL_COORDINATOR', label: 'Coordenador' },
  { value: 'SCHOOL_ADMIN', label: 'Administrador Escolar' },
  { value: 'SCHOOL_ADMINISTRATIVE', label: 'Administrativo' },
  { value: 'SCHOOL_TEACHER', label: 'Professor' },
  { value: 'SCHOOL_CANTEEN', label: 'Cantina' },
]

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.string().min(1, 'Selecione um cargo'),
})

type FormValues = z.infer<typeof formSchema>

interface NewEmployeeModalProps {
  schoolId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewEmployeeModal({ schoolId, open, onOpenChange }: NewEmployeeModalProps) {
  const queryClient = useQueryClient()
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
    },
  })

  const { mutateAsync: createEmployee, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await tuyau.api.v1.users.$post({
        name: values.name,
        email: values.email,
        password: Math.random().toString(36).slice(-8) + 'A1!',
        schoolId,
        roleId: values.role,
      })
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao criar funcionário')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-employees'] })
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const result = await createEmployee(values)
      if ((result as any)?.generatedPassword) {
        setGeneratedPassword((result as any).generatedPassword)
      } else {
        toast.success('Funcionário criado com sucesso!')
        handleClose()
      }
    } catch (error) {
      toast.error('Erro ao criar funcionário', {
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
            <DialogTitle>Funcionário criado com sucesso!</DialogTitle>
            <DialogDescription>
              Copie a senha gerada abaixo e envie para o funcionário.
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
              O funcionário deverá alterar a senha no primeiro acesso.
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
          <DialogTitle>Novo Funcionário</DialogTitle>
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
                    <Input placeholder="Nome do funcionário" {...field} />
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

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMPLOYEE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  'Criar Funcionário'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
