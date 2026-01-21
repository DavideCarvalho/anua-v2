import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'

import { useCreatePostMutation } from '../../hooks/mutations/use-create-post'

const PostType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  LINK: 'LINK',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
} as const

const PostVisibility = {
  PUBLIC: 'PUBLIC',
  SCHOOL_ONLY: 'SCHOOL_ONLY',
  CLASS_ONLY: 'CLASS_ONLY',
  PRIVATE: 'PRIVATE',
} as const

const formSchema = z.object({
  content: z.string().min(1, 'Conteudo e obrigatorio'),
  type: z.enum([
    PostType.TEXT,
    PostType.IMAGE,
    PostType.VIDEO,
    PostType.LINK,
    PostType.ANNOUNCEMENT,
  ]).default(PostType.TEXT),
  visibility: z.enum([
    PostVisibility.PUBLIC,
    PostVisibility.SCHOOL_ONLY,
    PostVisibility.CLASS_ONLY,
    PostVisibility.PRIVATE,
  ]).default(PostVisibility.SCHOOL_ONLY),
  attachmentUrl: z.string().url('URL invalida').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface NewPostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  classId?: string
}

export function NewPostModal({ open, onOpenChange, schoolId, classId }: NewPostModalProps) {
  const createPostMutation = useCreatePostMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      type: PostType.TEXT,
      visibility: PostVisibility.SCHOOL_ONLY,
      attachmentUrl: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    toast.promise(
      createPostMutation.mutateAsync({
        ...values,
        schoolId,
        classId,
        attachmentUrl: values.attachmentUrl || undefined,
      }),
      {
        loading: 'Publicando...',
        success: () => {
          form.reset()
          onOpenChange(false)
          return 'Publicacao criada!'
        },
        error: 'Erro ao publicar',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Publicacao</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteudo *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="O que voce quer compartilhar?"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PostType.TEXT}>Texto</SelectItem>
                        <SelectItem value={PostType.IMAGE}>Imagem</SelectItem>
                        <SelectItem value={PostType.VIDEO}>Video</SelectItem>
                        <SelectItem value={PostType.LINK}>Link</SelectItem>
                        <SelectItem value={PostType.ANNOUNCEMENT}>Anuncio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PostVisibility.PUBLIC}>Publico</SelectItem>
                        <SelectItem value={PostVisibility.SCHOOL_ONLY}>Escola</SelectItem>
                        <SelectItem value={PostVisibility.CLASS_ONLY}>Turma</SelectItem>
                        <SelectItem value={PostVisibility.PRIVATE}>Privado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(form.watch('type') === PostType.IMAGE ||
              form.watch('type') === PostType.VIDEO ||
              form.watch('type') === PostType.LINK) && (
              <FormField
                control={form.control}
                name="attachmentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Anexo</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createPostMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? 'Publicando...' : 'Publicar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
